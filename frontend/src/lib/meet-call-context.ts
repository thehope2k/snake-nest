import { createContext, useContext } from 'react'
import type { LocalVideoTrack, Room } from 'livekit-client'
import type { MeetParticipant } from './meet-api'

export type MeetCallStatus = 'idle' | 'connecting' | 'connected' | 'error'

export interface JoinCallOptions {
  microphoneEnabled?: boolean
  cameraEnabled?: boolean
  /** A preview track already created (and permission-granted) by PreJoinDialog -- publish
   * it directly instead of requesting the camera again, which would cause a visible
   * off/on flicker right as you join. */
  previewVideoTrack?: LocalVideoTrack | null
}

export interface MeetCallValue {
  activeNestId: string | null
  status: MeetCallStatus
  room: Room | null
  participants: MeetParticipant[]
  error: string | null
  expanded: boolean
  setExpanded: (expanded: boolean) => void
  joinCall: (nestId: string, options?: JoinCallOptions) => Promise<void>
  leaveCall: () => Promise<void>
}

export const MeetCallContext = createContext<MeetCallValue | null>(null)

export function useMeetCall(): MeetCallValue {
  const context = useContext(MeetCallContext)
  if (!context) throw new Error('useMeetCall must be used within MeetCallProvider')
  return context
}
