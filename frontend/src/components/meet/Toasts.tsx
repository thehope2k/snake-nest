import { useEffect, useState } from 'react'

interface ToastEntry {
  id: number
  text: string
}

let nextId = 0

export function useToasts() {
  const [toasts, setToasts] = useState<ToastEntry[]>([])

  function pushToast(text: string) {
    const id = nextId++
    setToasts((current) => [...current, { id, text }])
  }

  return { toasts, pushToast, dismiss: (id: number) => setToasts((current) => current.filter((t) => t.id !== id)) }
}

const TOAST_LIFETIME_MS = 3_200

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

  return (
    <div className="rounded-md border border-border-strong bg-elevated px-4 py-2 text-sm shadow-lg">{toast.text}</div>
  )
}
