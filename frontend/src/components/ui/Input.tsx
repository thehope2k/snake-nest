import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

export const FIELD_CHROME =
  'w-full rounded-md border border-border bg-panel px-3 py-2 text-sm text-fg placeholder:text-fg-subtle focus:outline-none focus:border-accent disabled:opacity-50'

export type InputProps = InputHTMLAttributes<HTMLInputElement>

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input({ className, ...props }, ref) {
  return <input ref={ref} className={cn(FIELD_CHROME, className)} {...props} />
})

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { bare?: boolean }

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea({ className, bare, ...props }, ref) {
  return <textarea ref={ref} className={cn(bare ? undefined : FIELD_CHROME, className)} {...props} />
})
