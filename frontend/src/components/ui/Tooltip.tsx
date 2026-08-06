import * as RadixTooltip from '@radix-ui/react-tooltip'
import type { ReactNode } from 'react'

export function TooltipProvider({ children }: { children: ReactNode }) {
  return <RadixTooltip.Provider delayDuration={300}>{children}</RadixTooltip.Provider>
}

export interface TooltipProps {
  label: string
  children: ReactNode
}

export function Tooltip({ label, children }: TooltipProps) {
  return (
    <RadixTooltip.Root>
      <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
      <RadixTooltip.Portal>
        <RadixTooltip.Content
          side="top"
          sideOffset={6}
          className="z-50 rounded-md border border-border bg-elevated px-2 py-1 text-xs text-fg shadow-md"
        >
          {label}
          <RadixTooltip.Arrow className="fill-elevated" />
        </RadixTooltip.Content>
      </RadixTooltip.Portal>
    </RadixTooltip.Root>
  )
}
