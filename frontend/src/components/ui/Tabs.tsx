import { cn } from '@/lib/cn'
import { tabTriggerClass } from './tab-styles'

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
