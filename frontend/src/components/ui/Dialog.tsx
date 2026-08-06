import * as RadixDialog from '@radix-ui/react-dialog'
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
      <RadixDialog.Overlay className="fixed inset-0 z-10 bg-black/50" />
      <RadixDialog.Content className="fixed left-1/2 top-1/2 z-20 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-panel p-6 focus:outline-none">
        <RadixDialog.Title className="mb-4 text-base font-semibold">{title}</RadixDialog.Title>
        {children}
      </RadixDialog.Content>
    </RadixDialog.Portal>
  )
}
