import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

export const FIELD_CHROME =
  'w-full rounded-md border border-border bg-panel px-3 py-2 text-sm text-fg placeholder:text-fg-subtle focus:outline-none focus:border-accent disabled:opacity-50'

export type InputProps = InputHTMLAttributes<HTMLInputElement>

export function Input({ className, ...props }: InputProps) {
  return <input className={cn(FIELD_CHROME, className)} {...props} />
}

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>

export function Textarea({ className, ...props }: TextareaProps) {
  return <textarea className={cn(FIELD_CHROME, className)} {...props} />
}
