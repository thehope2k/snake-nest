import type { ReactNode } from 'react'

export interface FieldProps {
  label: string
  hint?: string
  children: ReactNode
}

export function Field({ label, hint, children }: FieldProps) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-fg-muted">{label}</span>
      {children}
      {hint ? <span className="text-xs text-fg-subtle">{hint}</span> : null}
    </label>
  )
}
