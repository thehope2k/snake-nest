import { useNavigate } from 'react-router-dom'
import { RoomAudioRenderer, RoomContext, useLocalParticipant, useParticipants, useTracks } from '@livekit/components-react'
import { Track } from 'livekit-client'
import { Camera, CameraOff, Maximize2, Mic, MicOff, PhoneOff } from 'lucide-react'
import { Avatar, Badge, Dialog, DialogContent, DialogTrigger, IconButton } from '@/components/ui'
import { ParticipantTile } from './ParticipantTile'
import { ToastStack, useToasts } from './Toasts'
import { useMeetCall } from '@/lib/meet-call'
import { useNestStore, type DoghouseRejection } from '@/lib/nest-store'
import { useAuth } from '@/lib/auth'
import { nestIdentity } from '@/lib/nest-identity'

const REJECTION_COPY: Record<DoghouseRejection, string> = {
  'opted-out': 'They opted out of the Doghouse — respected, no exceptions.',
  'already-benched': 'Already in the Doghouse.',
  'on-cooldown': 'Still on cooldown from last time — no pile-ons.',
  'nest-full': 'Too many people benched already — the room needs someone to talk.',
}

// Mounted once at the app level (see App.tsx), outside any per-Nest routing, so an active
// call keeps floating regardless of which Nest or view you navigate to. See
// docs/architecture.md's Meet section and docs/product/ux-philosophy.md's "floating call
// control" for why this can't just live inside NestView.
export function FloatingCallWidget() {
  const { activeNestId, room, status } = useMeetCall()

  if (!activeNestId || !room || status !== 'connected') return null

  return (
    <RoomContext.Provider value={room}>
      <RoomAudioRenderer />
      <ActiveCallPanel nestId={activeNestId} />
    </RoomContext.Provider>
  )
}

function ActiveCallPanel({ nestId }: { nestId: string }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const store = useNestStore()
  const { leaveCall } = useMeetCall()
  const liveParticipants = useParticipants()
  const cameraTracks = useTracks([Track.Source.Camera])
  const { isMicrophoneEnabled, isCameraEnabled, localParticipant } = useLocalParticipant()
  const { toasts, pushToast, dismiss } = useToasts()

  const nest = store.nests.find((n) => n.id === nestId)
  const members = store.membersFor(nestId)

  if (!nest || !user) return null

  const usersById = new Map(members.map((member) => [member.id, member]))
  const doghouseByUserId = new Map(store.participantsFor(nestId).map((participant) => [participant.userId, participant]))
  const cameraTrackByIdentity = new Map(cameraTracks.map((track) => [track.participant.identity, track]))
  const identity = nestIdentity(nest, members, user.id)
  const isOwner = nest.ownerId === user.id

  function handleSendToDoghouse(targetUserId: string) {
    const rejection = store.sendToDoghouse(nestId, targetUserId)
    if (rejection) {
      pushToast(REJECTION_COPY[rejection], 'warning')
      return
    }
    const target = usersById.get(targetUserId)
    pushToast(`Everyone: shh... we're talking about ${target?.name ?? 'them'} 🤫`, 'doghouse')
  }

  const grid = (
    <div className="grid min-h-0 flex-1 grid-cols-2 gap-3 overflow-y-auto sm:grid-cols-3 lg:grid-cols-4">
      {liveParticipants.map((participant) => {
        const person = usersById.get(participant.identity)
        const doghouseState = doghouseByUserId.get(participant.identity)
        if (!person || !doghouseState) return null
        return (
          <ParticipantTile
            key={participant.identity}
            user={person}
            participant={doghouseState}
            now={store.now}
            isSelf={participant.identity === user.id}
            canRelease={isOwner}
            videoTrackRef={cameraTrackByIdentity.get(participant.identity)}
            onSendToDoghouse={() => handleSendToDoghouse(participant.identity)}
            onRelease={() => store.releaseFromDoghouse(nestId, participant.identity)}
            onToggleOptOut={(optOut) => store.setDoghouseOptOut(nestId, participant.identity, optOut)}
          />
        )
      })}
    </div>
  )

  return (
    <div className="fixed bottom-4 right-4 z-40 w-80 rounded-lg border border-border bg-panel shadow-lg">
      <div className="flex items-center gap-1 px-3 py-2">
        <button
          type="button"
          onClick={() => navigate(`/nests/${nestId}`)}
          className="flex min-w-0 flex-1 items-center gap-2 rounded-md py-0.5 text-left transition-colors hover:bg-elevated"
        >
          <Avatar name={identity.name} seed={nest.id} emoji={identity.icon} size="sm" />
          <span className="truncate text-sm font-medium">{identity.name}</span>
        </button>
        <Badge tone="success" className="shrink-0">
          {liveParticipants.length}
        </Badge>
        <IconButton
          aria-label={isMicrophoneEnabled ? 'Mute microphone' : 'Unmute microphone'}
          size="sm"
          onClick={() => localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled)}
        >
          {isMicrophoneEnabled ? <Mic size={16} /> : <MicOff size={16} className="text-doghouse" />}
        </IconButton>
        <IconButton
          aria-label={isCameraEnabled ? 'Turn off camera' : 'Turn on camera'}
          size="sm"
          onClick={() => localParticipant.setCameraEnabled(!isCameraEnabled)}
        >
          {isCameraEnabled ? <Camera size={16} /> : <CameraOff size={16} className="text-fg-subtle" />}
        </IconButton>
        <Dialog>
          <DialogTrigger asChild>
            <IconButton aria-label="Expand call">
              <Maximize2 size={16} />
            </IconButton>
          </DialogTrigger>
          <DialogContent title={identity.name} size="full">
            <div className="mb-3 flex shrink-0 items-center gap-2">
              <Badge tone="success">{liveParticipants.length} on a call</Badge>
              <IconButton
                aria-label={isMicrophoneEnabled ? 'Mute microphone' : 'Unmute microphone'}
                size="sm"
                className="ml-auto"
                onClick={() => localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled)}
              >
                {isMicrophoneEnabled ? <Mic size={16} /> : <MicOff size={16} className="text-doghouse" />}
              </IconButton>
              <IconButton
                aria-label={isCameraEnabled ? 'Turn off camera' : 'Turn on camera'}
                size="sm"
                onClick={() => localParticipant.setCameraEnabled(!isCameraEnabled)}
              >
                {isCameraEnabled ? <Camera size={16} /> : <CameraOff size={16} className="text-fg-subtle" />}
              </IconButton>
              <IconButton aria-label="Leave call" size="sm" onClick={() => leaveCall()} className="text-doghouse hover:text-doghouse">
                <PhoneOff size={16} />
              </IconButton>
            </div>
            {grid}
          </DialogContent>
        </Dialog>
        <IconButton aria-label="Leave call" size="sm" onClick={() => leaveCall()} className="text-doghouse hover:text-doghouse">
          <PhoneOff size={16} />
        </IconButton>
      </div>

      <ToastStack toasts={toasts} dismiss={dismiss} />
    </div>
  )
}
