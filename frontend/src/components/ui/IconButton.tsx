import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

export type IconButtonSize = 'sm' | 'md' | 'lg'
export type IconButtonVariant = 'ghost' | 'primary'

export const ICON_PIXEL_SIZE: Record<IconButtonSize, number> = {
  sm: 14,
  md: 16,
  lg: 20,
}

const HIT_TARGET_CLASSES: Record<IconButtonSize, string> = {
  sm: 'h-7 w-7',
  md: 'h-8 w-8',
  lg: 'h-10 w-10',
}

const VARIANT_CLASSES: Record<IconButtonVariant, string> = {
  ghost: 'text-fg-muted hover:bg-elevated hover:text-fg',
  primary: 'bg-accent text-accent-fg hover:bg-accent-hover',
}

const BASE_CLASSES =
  'inline-flex shrink-0 items-center justify-center rounded-md transition-colors disabled:opacity-50 disabled:pointer-events-none'

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: IconButtonSize
  variant?: IconButtonVariant
  'aria-label': string
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { size = 'md', variant = 'ghost', className, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      className={cn(BASE_CLASSES, VARIANT_CLASSES[variant], HIT_TARGET_CLASSES[size], className)}
      {...props}
    />
  )
})
