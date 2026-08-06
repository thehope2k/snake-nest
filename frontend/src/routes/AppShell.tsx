import { Outlet } from 'react-router-dom'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui'
import { NestSidebar } from '@/components/nest/NestSidebar'

const SIDEBAR_DEFAULT_PX = 260
const SIDEBAR_MIN_PX = 200
const SIDEBAR_MAX_PX = 420

export function AppShell() {
  return (
    <ResizablePanelGroup orientation="horizontal">
      <ResizablePanel defaultSize={SIDEBAR_DEFAULT_PX} minSize={SIDEBAR_MIN_PX} maxSize={SIDEBAR_MAX_PX}>
        <NestSidebar />
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel>
        <Outlet />
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}
