import * as RadixPopover from '@radix-ui/react-popover'
import { SmilePlus } from 'lucide-react'
import type { ReactNode } from 'react'
import { IconButton } from './IconButton'
import { cn } from '@/lib/cn'

const EMOJI_PALETTE = [
  '🔥', '💀', '🐍', '👍', '❤️', '😂', '😮', '😢',
  '👏', '🎉', '🐶', '🙏', '🤔', '😅', '💯', '🥹',
]

export interface EmojiPickerProps {
  onSelect: (emoji: string) => void
  trigger?: ReactNode
  align?: 'start' | 'center' | 'end'
}

export function EmojiPicker({ onSelect, trigger, align = 'end' }: EmojiPickerProps) {
  return (
    <RadixPopover.Root>
      <RadixPopover.Trigger asChild>
        {trigger ?? (
          <IconButton aria-label="Add emoji" size="sm" className="rounded-full">
            <SmilePlus size={14} />
          </IconButton>
        )}
      </RadixPopover.Trigger>
      <RadixPopover.Portal>
        <RadixPopover.Content
          align={align}
          sideOffset={6}
          className={cn(
            'z-30 grid grid-cols-8 gap-0.5 rounded-lg border border-border bg-elevated p-1.5 shadow-lg focus:outline-none',
          )}
        >
          {EMOJI_PALETTE.map((emoji) => (
            <RadixPopover.Close key={emoji} asChild>
              <button
                type="button"
                onClick={() => onSelect(emoji)}
                aria-label={`Pick ${emoji}`}
                className="flex h-8 w-8 items-center justify-center rounded-md text-base transition-colors hover:bg-elevated-2"
              >
                {emoji}
              </button>
            </RadixPopover.Close>
          ))}
        </RadixPopover.Content>
      </RadixPopover.Portal>
    </RadixPopover.Root>
  )
}
