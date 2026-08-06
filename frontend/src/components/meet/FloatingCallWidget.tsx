import { RoomAudioRenderer, RoomContext } from '@livekit/components-react'
import { useMeetCall } from '@/lib/meet-call'
import { CollapsedPill } from './CollapsedPill'
import { ExpandedCallView } from './ExpandedCallView'

export function FloatingCallWidget() {
  const { activeNestId, room, status, expanded } = useMeetCall()

  if (!activeNestId || !room || status !== 'connected') return null

  return (
    <RoomContext.Provider value={room}>
      <RoomAudioRenderer />
      {expanded ? <ExpandedCallView nestId={activeNestId} /> : <CollapsedPill nestId={activeNestId} />}
    </RoomContext.Provider>
  )
}
