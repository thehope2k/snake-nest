import { useEffect, useState } from 'react'
import { AlertTriangle, CheckCircle2, Dog, Info, X, type LucideIcon } from 'lucide-react'
import { IconButton } from '@/components/ui'
import { cn } from '@/lib/cn'
import type { BadgeTone } from '@/components/ui'

export type ToastTone = BadgeTone

interface ToastEntry {
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

const TOAST_LIFETIME_MS = 3_200

const TONE_ICON: Record<ToastTone, LucideIcon> = {
  neutral: Info,
  accent: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  doghouse: Dog,
}

const TONE_ICON_CLASSES: Record<ToastTone, string> = {
  neutral: 'text-fg-muted',
  accent: 'text-accent',
  success: 'text-success',
  warning: 'text-warning',
  doghouse: 'text-doghouse',
}

export function ToastStack({ toasts, dismiss }: { toasts: ToastEntry[]; dismiss: (id: number) => void }) {
  return (
    <div className="pointer-events-none fixed bottom-6 left-1/2 z-30 flex -translate-x-1/2 flex-col gap-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onExpire={() => dismiss(toast.id)} />
      ))}
    </div>
  )
}

function ToastItem({ toast, onExpire }: { toast: ToastEntry; onExpire: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onExpire, TOAST_LIFETIME_MS)
    return () => clearTimeout(timer)
  }, [onExpire])

  const Icon = TONE_ICON[toast.tone]

  return (
    <div className="toast-item pointer-events-auto flex items-center gap-2 rounded-md border border-border-strong bg-elevated px-4 py-2 text-sm shadow-lg">
      <Icon size={16} className={cn('shrink-0', TONE_ICON_CLASSES[toast.tone])} />
      <span>{toast.text}</span>
      <IconButton onClick={onExpire} aria-label="Dismiss" size="sm" className="-mr-1 ml-1 rounded-full">
        <X size={14} />
      </IconButton>
    </div>
  )
}
