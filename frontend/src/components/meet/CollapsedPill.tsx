import { useNavigate } from 'react-router-dom'
import { Camera, CameraOff, Maximize2, Mic, MicOff, PhoneOff } from 'lucide-react'
import { Avatar, Badge, IconButton } from '@/components/ui'
import { useMeetCall } from '@/lib/meet-call'
import { useActiveCall } from './useActiveCall'
import { ToastStack } from './Toasts'

interface CollapsedPillProps {
  nestId: string
}

export function CollapsedPill({ nestId }: CollapsedPillProps) {
  const navigate = useNavigate()
  const { leaveCall, setExpanded } = useMeetCall()
  const call = useActiveCall(nestId)

  if (!call.nest || !call.identity) return null

  return (
    <div className="fixed bottom-4 right-4 z-40 w-80 rounded-lg border border-border bg-panel shadow-lg">
      <div className="flex items-center gap-1 px-3 py-2">
        <button
          type="button"
          onClick={() => navigate(`/nests/${nestId}`)}
          className="flex min-w-0 flex-1 items-center gap-2 rounded-md py-0.5 text-left transition-colors hover:bg-elevated"
        >
          <Avatar name={call.identity.name} seed={call.nest.id} emoji={call.identity.icon} size="sm" />
          <span className="truncate text-sm font-medium">{call.identity.name}</span>
        </button>
        <Badge tone="success" className="shrink-0">
          {call.liveParticipants.length}
        </Badge>
        <IconButton
          aria-label={call.isMicrophoneEnabled ? 'Mute microphone' : 'Unmute microphone'}
          size="sm"
          onClick={() => call.localParticipant.setMicrophoneEnabled(!call.isMicrophoneEnabled)}
        >
          {call.isMicrophoneEnabled ? <Mic size={16} /> : <MicOff size={16} className="text-doghouse" />}
        </IconButton>
        <IconButton
          aria-label={call.isCameraEnabled ? 'Turn off camera' : 'Turn on camera'}
          size="sm"
          onClick={() => call.localParticipant.setCameraEnabled(!call.isCameraEnabled)}
        >
          {call.isCameraEnabled ? <Camera size={16} /> : <CameraOff size={16} className="text-fg-subtle" />}
        </IconButton>
        <IconButton aria-label="Expand call" size="sm" onClick={() => setExpanded(true)}>
          <Maximize2 size={16} />
        </IconButton>
        <IconButton aria-label="Leave call" size="sm" onClick={() => leaveCall()} className="text-doghouse hover:text-doghouse">
          <PhoneOff size={16} />
        </IconButton>
      </div>

      <ToastStack toasts={call.toasts} dismiss={call.dismiss} />
    </div>
  )
}
