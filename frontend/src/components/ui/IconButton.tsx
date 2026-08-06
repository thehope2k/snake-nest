import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

export type IconButtonSize = 'sm' | 'md' | 'lg'

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

const BASE_CLASSES =
  'inline-flex shrink-0 items-center justify-center rounded-md text-fg-muted transition-colors hover:bg-elevated hover:text-fg disabled:opacity-50 disabled:pointer-events-none'

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: IconButtonSize
  'aria-label': string
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { size = 'md', className, ...props },
  ref,
) {
  return <button ref={ref} type="button" className={cn(BASE_CLASSES, HIT_TARGET_CLASSES[size], className)} {...props} />
})
