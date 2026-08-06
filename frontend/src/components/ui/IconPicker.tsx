import { cn } from '@/lib/cn'

export interface IconPickerProps {
  options: readonly string[]
  value: string
  onChange: (value: string) => void
  'aria-label'?: string
}

export function IconPicker({ options, value, onChange, 'aria-label': ariaLabel }: IconPickerProps) {
  return (
    <div role="radiogroup" aria-label={ariaLabel} className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          role="radio"
          aria-checked={value === option}
          onClick={() => onChange(option)}
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-md border text-lg transition-colors',
            value === option ? 'border-accent bg-elevated' : 'border-border hover:bg-elevated',
          )}
        >
          {option}
        </button>
      ))}
    </div>
  )
}
