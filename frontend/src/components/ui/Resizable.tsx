import { Group, Panel, Separator, type GroupProps, type PanelProps } from 'react-resizable-panels'
import { cn } from '@/lib/cn'

export function ResizablePanelGroup({ className, ...props }: GroupProps) {
  return <Group className={cn('flex h-full w-full', className)} {...props} />
}

export function ResizablePanel(props: PanelProps) {
  return <Panel {...props} />
}

export function ResizableHandle() {
  return (
    <Separator className="group relative w-px shrink-0 bg-border">
      <span className="absolute inset-y-0 left-1/2 w-3 -translate-x-1/2 group-hover:bg-accent/20 group-active:bg-accent/30" />
    </Separator>
  )
}
