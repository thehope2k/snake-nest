import { useState } from 'react'
import type { BadgeTone } from '@/components/ui'

export type ToastTone = BadgeTone

export interface ToastEntry {
  id: number
  text: string
  tone: ToastTone
}

let nextId = 0

export function useToasts() {
  const [toasts, setToasts] = useState<ToastEntry[]>([])

  function pushToast(text: string, tone: ToastTone = 'neutral') {
    const id = nextId++
    setToasts((current) => [...current, { id, text, tone }])
  }

  return { toasts, pushToast, dismiss: (id: number) => setToasts((current) => current.filter((t) => t.id !== id)) }
}
