import * as RadixDialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import type { ReactNode } from 'react'

export const Dialog = RadixDialog.Root
export const DialogTrigger = RadixDialog.Trigger

export interface DialogContentProps {
  title: string
  children: ReactNode
}

export function DialogContent({ title, children }: DialogContentProps) {
  return (
    <RadixDialog.Portal>
      <RadixDialog.Overlay className="dialog-overlay fixed inset-0 z-10 bg-black/50" />
      <RadixDialog.Content className="dialog-content fixed left-1/2 top-1/2 z-20 w-full max-w-sm rounded-lg border border-border bg-panel p-6 shadow-lg focus:outline-none">
        <RadixDialog.Title className="mb-4 pr-6 text-base font-semibold">{title}</RadixDialog.Title>
        {children}
        <RadixDialog.Close
          aria-label="Close"
          className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-md text-fg-subtle transition-colors hover:bg-elevated hover:text-fg"
        >
          <X size={16} />
        </RadixDialog.Close>
      </RadixDialog.Content>
    </RadixDialog.Portal>
  )
}
