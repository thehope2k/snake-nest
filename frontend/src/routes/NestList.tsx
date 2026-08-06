import { CreateNestDialog } from '@/components/nest/CreateNestDialog'
import { useNestStore } from '@/lib/nest-store'

export function NestList() {
  const { nests } = useNestStore()

  return (
    <main className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
      <span className="text-3xl">🐍</span>
      <p className="text-sm text-fg-muted">
        {nests.length > 0 ? 'Pick a Nest from the sidebar, or start a new one.' : 'No Nests yet — create one to get started.'}
      </p>
      <CreateNestDialog />
    </main>
  )
}
