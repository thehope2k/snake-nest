import { CreateNestDialog } from '@/components/nest/CreateNestDialog'
import { useNestStore } from '@/lib/nest-store'
import { useAuth } from '@/lib/mock-auth'

export function NestList() {
  const { user } = useAuth()
  const { nests } = useNestStore()
  const hasNests = nests.some((nest) => user && nest.memberIds.includes(user.id))

  return (
    <main className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
      <span className="text-3xl">🐍</span>
      <p className="text-sm text-fg-muted">
        {hasNests ? 'Pick a Nest from the sidebar, or start a new one.' : 'No Nests yet — create one to get started.'}
      </p>
      <CreateNestDialog />
    </main>
  )
}
