import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { RoomAudioRenderer, RoomContext, useLocalParticipant, useParticipants } from '@livekit/components-react'
import { ChevronDown, ChevronUp, Mic, MicOff, PhoneOff } from 'lucide-react'
import { Avatar, Badge, IconButton } from '@/components/ui'
import { ParticipantTile } from './ParticipantTile'
import { ToastStack, useToasts } from './Toasts'
import { useMeetCall } from '@/lib/meet-call'
import { useNestStore, type DoghouseRejection } from '@/lib/nest-store'
import { useAuth } from '@/lib/auth'
import { nestIdentity } from '@/lib/nest-identity'

const EXPANDED_MAX_HEIGHT_PX = 320

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
  const [expanded, setExpanded] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()
  const store = useNestStore()
  const { leaveCall } = useMeetCall()
  const liveParticipants = useParticipants()
  const { isMicrophoneEnabled, localParticipant } = useLocalParticipant()
  const { toasts, pushToast, dismiss } = useToasts()

  const nest = store.nests.find((n) => n.id === nestId)
  const members = store.membersFor(nestId)

  if (!nest || !user) return null

  const usersById = new Map(members.map((member) => [member.id, member]))
  const doghouseByUserId = new Map(store.participantsFor(nestId).map((participant) => [participant.userId, participant]))
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
        <IconButton aria-label={expanded ? 'Collapse call' : 'Expand call'} size="sm" onClick={() => setExpanded((value) => !value)}>
          {expanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        </IconButton>
        <IconButton aria-label="Leave call" size="sm" onClick={() => leaveCall()} className="text-doghouse hover:text-doghouse">
          <PhoneOff size={16} />
        </IconButton>
      </div>

      {expanded && (
        <div
          className="grid grid-cols-2 gap-2 overflow-y-auto border-t border-border p-3"
          style={{ maxHeight: EXPANDED_MAX_HEIGHT_PX }}
        >
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
                onSendToDoghouse={() => handleSendToDoghouse(participant.identity)}
                onRelease={() => store.releaseFromDoghouse(nestId, participant.identity)}
                onToggleOptOut={(optOut) => store.setDoghouseOptOut(nestId, participant.identity, optOut)}
              />
            )
          })}
        </div>
      )}

      <ToastStack toasts={toasts} dismiss={dismiss} />
    </div>
  )
}
