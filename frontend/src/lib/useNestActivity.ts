import { useEffect, useRef } from 'react'
import { useNestStore } from './nest-store-context'

// Tracks per-nest "seen" message counts client-side. Once real read-receipts
// arrive over WebSocket (see architecture.md), swap the ref for server state
// here — callers (NestSidebar) don't need to change.
export function useNestActivity(activeNestId: string | undefined) {
  const store = useNestStore()
  const seenCountByNest = useRef<Record<string, number>>({})

  useEffect(() => {
    if (!activeNestId) return
    seenCountByNest.current[activeNestId] = store.messagesFor(activeNestId).length
  })

  function unreadCountFor(nestId: string): number {
    const seen = seenCountByNest.current[nestId] ?? 0
    const total = store.messagesFor(nestId).length
    return Math.max(0, total - seen)
  }

  return { unreadCountFor }
}
