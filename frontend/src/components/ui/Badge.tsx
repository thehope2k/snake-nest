import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

export type BadgeTone = 'neutral' | 'accent' | 'doghouse'

const TONE_CLASSES: Record<BadgeTone, string> = {
  neutral: 'bg-elevated text-fg-muted',
  accent: 'bg-accent/15 text-accent',
  doghouse: 'bg-doghouse/15 text-doghouse',
}

export interface BadgeProps {
  tone?: BadgeTone
  children: ReactNode
}

export function Badge({ tone = 'neutral', children }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        TONE_CLASSES[tone],
      )}
    >
      {children}
    </span>
  )
}
