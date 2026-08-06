import { useRef, type RefObject } from 'react'
import { Camera, CameraOff, Mic, MicOff, Minimize2, PhoneOff } from 'lucide-react'
import { useGridLayout } from '@livekit/components-react'
import { Avatar, Badge, IconButton } from '@/components/ui'
import { useMeetCall } from '@/lib/meet-call-context'
import { useActiveCall } from './useActiveCall'
import { ParticipantTile } from './ParticipantTile'
import { ToastStack } from './Toasts'

interface ExpandedCallViewProps {
  nestId: string
}

export function ExpandedCallView({ nestId }: ExpandedCallViewProps) {
  const { leaveCall, setExpanded } = useMeetCall()
  const call = useActiveCall(nestId)
  const gridRef = useRef<HTMLDivElement>(null)
  const { layout } = useGridLayout(gridRef as RefObject<HTMLDivElement>, call.liveParticipants.length)

  if (!call.nest || !call.identity || !call.user) return null

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-app">
      <header className="flex shrink-0 items-center gap-3 border-b border-border px-4 py-3">
        <Avatar name={call.identity.name} seed={call.nest.id} emoji={call.identity.icon} size="sm" />
        <span className="font-semibold">{call.identity.name}</span>
        <Badge tone="success">{call.liveParticipants.length} on a call</Badge>
        <div className="ml-auto flex items-center gap-1">
          <IconButton
            aria-label={call.isMicrophoneEnabled ? 'Mute microphone' : 'Unmute microphone'}
            onClick={() => call.localParticipant.setMicrophoneEnabled(!call.isMicrophoneEnabled)}
          >
            {call.isMicrophoneEnabled ? <Mic size={18} /> : <MicOff size={18} className="text-doghouse" />}
          </IconButton>
          <IconButton
            aria-label={call.isCameraEnabled ? 'Turn off camera' : 'Turn on camera'}
            onClick={() => call.localParticipant.setCameraEnabled(!call.isCameraEnabled)}
          >
            {call.isCameraEnabled ? <Camera size={18} /> : <CameraOff size={18} className="text-fg-subtle" />}
          </IconButton>
          <IconButton aria-label="Minimize call" onClick={() => setExpanded(false)}>
            <Minimize2 size={18} />
          </IconButton>
          <IconButton aria-label="Leave call" onClick={() => leaveCall()} className="text-doghouse hover:text-doghouse">
            <PhoneOff size={18} />
          </IconButton>
        </div>
      </header>

      <div
        ref={gridRef}
        className="grid min-h-0 flex-1 place-content-center gap-3 overflow-y-auto p-4"
        style={{ gridTemplateColumns: `repeat(${layout.columns}, minmax(0, 1fr))` }}
      >
        {call.liveParticipants.map((participant) => {
          const person = call.usersById.get(participant.identity)
          const doghouseState = call.doghouseByUserId.get(participant.identity)
          if (!person || !doghouseState) return null
          return (
            <ParticipantTile
              key={participant.identity}
              user={person}
              participant={doghouseState}
              now={call.store.now}
              isSelf={participant.identity === call.user!.id}
              canRelease={call.isOwner}
              videoTrackRef={call.cameraTrackByIdentity.get(participant.identity)}
              onSendToDoghouse={() => call.handleSendToDoghouse(participant.identity)}
              onRelease={() => call.handleRelease(participant.identity)}
            />
          )
        })}
      </div>

      <ToastStack toasts={call.toasts} dismiss={call.dismiss} />
    </div>
  )
}
