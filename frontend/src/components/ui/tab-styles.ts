import { cn } from '@/lib/cn'

export function tabTriggerClass(active: boolean): string {
  return cn(
    'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
    active ? 'bg-elevated-2 text-fg' : 'text-fg-muted hover:bg-elevated hover:text-fg',
  )
}
