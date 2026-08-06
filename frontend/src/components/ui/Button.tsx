import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

export type ButtonVariant = 'primary' | 'outline' | 'ghost' | 'link'

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-accent-fg hover:bg-accent-hover',
  outline: 'border border-border-strong text-fg hover:bg-elevated',
  ghost: 'text-fg-muted hover:bg-elevated hover:text-fg',
  link: 'text-accent hover:underline p-0',
}

const BASE_CLASSES =
  'inline-flex items-center justify-center gap-2 rounded-md px-3.5 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', className, ...props },
  ref,
) {
  return <button ref={ref} className={cn(BASE_CLASSES, VARIANT_CLASSES[variant], className)} {...props} />
})
