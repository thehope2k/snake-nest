import { Link } from 'react-router-dom'
import { CreateNestDialog } from '@/components/nest/CreateNestDialog'
import { useAuth } from '@/lib/mock-auth'
import { useNestStore } from '@/lib/nest-store'

export function NestList() {
  const { user, signOut } = useAuth()
  const { nests } = useNestStore()
  const myNests = nests.filter((nest) => user && nest.memberIds.includes(user.id))

  return (
    <main className="mx-auto flex min-h-full max-w-md flex-col gap-6 p-8">
      <header className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Your Nests</h1>
        <button onClick={signOut} className="text-xs text-fg-subtle hover:text-fg-muted">
          sign out
        </button>
      </header>

      {myNests.length === 0 ? (
        <p className="text-sm text-fg-muted">No Nests yet — create one to get started.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {myNests.map((nest) => (
            <li key={nest.id}>
              <Link
                to={`/nests/${nest.id}/chat`}
                className="flex items-center gap-3 rounded-md border border-border bg-panel p-3 hover:bg-elevated"
              >
                <span className="text-xl">{nest.icon}</span>
                <span className="text-sm font-medium">{nest.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <CreateNestDialog />
    </main>
  )
}
