import { Room } from 'livekit-client'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useAuth } from './auth-context'
import { joinMeetRequest, leaveMeetRequest, type MeetParticipant } from './meet-api'
import { MeetCallContext, type JoinCallOptions, type MeetCallStatus, type MeetCallValue } from './meet-call-context'

export type { MeetCallStatus, JoinCallOptions }

// Owns the single LiveKit Room connection for the whole app — deliberately not scoped to
// NestView, so joining a call doesn't get torn down by navigating to a different Nest or
// back to Chat. See docs/architecture.md's Meet section for why.
export function MeetCallProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth()
  const [activeNestId, setActiveNestId] = useState<string | null>(null)
  const [status, setStatus] = useState<MeetCallStatus>('idle')
  const [room, setRoom] = useState<Room | null>(null)
  const [participants, setParticipants] = useState<MeetParticipant[]>([])
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(false)
  const roomRef = useRef<Room | null>(null)
  const activeNestIdRef = useRef<string | null>(null)

  useEffect(() => {
    function handleBeforeUnload() {
      roomRef.current?.disconnect()
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [])

  useEffect(
    () => () => {
      roomRef.current?.disconnect()
    },
    [],
  )

  async function joinCall(nestId: string, options?: JoinCallOptions) {
    if (!token) return
    if (activeNestIdRef.current === nestId) return
    if (activeNestIdRef.current) await leaveCall()

    setStatus('connecting')
    setError(null)
    try {
      const response = await joinMeetRequest(token, nestId)
      const nextRoom = new Room()
      await nextRoom.connect(response.livekitUrl, response.token)

      try {
        await nextRoom.localParticipant.setMicrophoneEnabled(options?.microphoneEnabled ?? true)
      } catch {
        // Mic permission denied/unavailable shouldn't block joining the call itself —
        // you can still hear others and retry unmuting later.
      }

      if (options?.cameraEnabled) {
        try {
          if (options.previewVideoTrack) {
            await nextRoom.localParticipant.publishTrack(options.previewVideoTrack)
          } else {
            await nextRoom.localParticipant.setCameraEnabled(true)
          }
        } catch {
          // Same reasoning as mic -- camera failing to publish shouldn't block the join.
        }
      }

      roomRef.current = nextRoom
      activeNestIdRef.current = nestId
      setRoom(nextRoom)
      setActiveNestId(nestId)
      setParticipants(response.participants)
      setStatus('connected')
      setExpanded(true)
    } catch (cause) {
      setStatus('error')
      setError(cause instanceof Error ? cause.message : 'Could not join the call.')
    }
  }

  async function leaveCall() {
    const nestId = activeNestIdRef.current
    const currentRoom = roomRef.current
    roomRef.current = null
    activeNestIdRef.current = null
    setRoom(null)
    setActiveNestId(null)
    setParticipants([])
    setStatus('idle')
    setExpanded(false)

    currentRoom?.disconnect()
    if (nestId && token) {
      try {
        await leaveMeetRequest(token, nestId)
      } catch {
        // Best-effort — the LiveKit webhook reconciles Redis presence even if this call fails.
      }
    }
  }

  const value: MeetCallValue = { activeNestId, status, room, participants, error, expanded, setExpanded, joinCall, leaveCall }

  return <MeetCallContext.Provider value={value}>{children}</MeetCallContext.Provider>
}
