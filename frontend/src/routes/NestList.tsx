import { MessagesSquare } from 'lucide-react'
import { EmptyState } from '@/components/ui'
import { CreateNestDialog } from '@/components/nest/CreateNestDialog'
import { useNestStore } from '@/lib/nest-store'

export function NestList() {
  const { nests, nestsLoaded, nestsError } = useNestStore()

  if (!nestsLoaded) return null

  return (
    <main className="flex h-full flex-col items-center justify-center">
      <EmptyState
        icon={MessagesSquare}
        title={nestsError ? 'Something went wrong' : nests.length > 0 ? 'Pick a Nest from the sidebar' : 'No Nests yet'}
        description={
          nestsError
            ? nestsError
            : nests.length > 0
              ? 'Or start a new one below.'
              : 'Create one to get started, or join with an invite code.'
        }
        action={<CreateNestDialog />}
      />
    </main>
  )
}
