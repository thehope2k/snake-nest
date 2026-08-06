import { cn } from '@/lib/cn'

export function tabTriggerClass(active: boolean): string {
  return cn(
    'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
    active ? 'bg-elevated-2 text-fg' : 'text-fg-muted hover:bg-elevated hover:text-fg',
  )
}

export interface TabItem<T extends string> {
  value: T
  label: string
}

export interface TabsProps<T extends string> {
  items: TabItem<T>[]
  value: T
  onValueChange: (value: T) => void
  className?: string
}

export function Tabs<T extends string>({ items, value, onValueChange, className }: TabsProps<T>) {
  return (
    <div role="tablist" className={cn('flex gap-1 rounded-md bg-elevated p-1', className)}>
      {items.map((item) => (
        <button
          key={item.value}
          type="button"
          role="tab"
          aria-selected={item.value === value}
          onClick={() => onValueChange(item.value)}
          className={cn('flex-1', tabTriggerClass(item.value === value))}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}
