import * as RadixDropdownMenu from '@radix-ui/react-dropdown-menu'
import type { ReactNode } from 'react'

export const DropdownMenu = RadixDropdownMenu.Root
export const DropdownMenuTrigger = RadixDropdownMenu.Trigger

export function DropdownMenuContent({ children }: { children: ReactNode }) {
  return (
    <RadixDropdownMenu.Portal>
      <RadixDropdownMenu.Content
        align="end"
        sideOffset={4}
        className="z-30 min-w-[10rem] rounded-md border border-border bg-elevated p-1 shadow-lg focus:outline-none"
      >
        {children}
      </RadixDropdownMenu.Content>
    </RadixDropdownMenu.Portal>
  )
}

export interface DropdownMenuItemProps {
  onSelect: () => void
  destructive?: boolean
  children: ReactNode
}

export function DropdownMenuItem({ onSelect, destructive, children }: DropdownMenuItemProps) {
  return (
    <RadixDropdownMenu.Item
      onSelect={onSelect}
      className={`cursor-pointer rounded-sm px-2 py-1.5 text-sm outline-none data-[highlighted]:bg-elevated-2 ${
        destructive ? 'text-doghouse' : 'text-fg'
      }`}
    >
      {children}
    </RadixDropdownMenu.Item>
  )
}
