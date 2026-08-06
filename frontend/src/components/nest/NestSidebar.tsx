import { LogOut, Plus } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { CreateNestDialog } from '@/components/nest/CreateNestDialog'
import { useAuth } from '@/lib/auth'
import { useNestStore } from '@/lib/nest-store'
import { cn } from '@/lib/cn'

export function NestSidebar() {
  const { user, signOut } = useAuth()
  const { nests } = useNestStore()
  const { nestId: activeNestId } = useParams<{ nestId?: string }>()
  const myNests = nests.filter((nest) => user && nest.memberIds.includes(user.id))

  return (
    <aside className="flex h-full flex-col bg-panel">
      <div className="flex items-center justify-between border-b border-border p-3">
        <span className="text-sm font-semibold">🐍 The Nest</span>
        <CreateNestDialog
          trigger={
            <button aria-label="Create a Nest" className="text-fg-muted hover:text-fg">
              <Plus size={16} />
            </button>
          }
        />
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-2">
        {myNests.length === 0 ? (
          <p className="p-2 text-xs text-fg-subtle">No Nests yet — create one.</p>
        ) : (
          myNests.map((nest) => (
            <Link
              key={nest.id}
              to={`/nests/${nest.id}/chat`}
              className={cn(
                'flex items-center gap-2 truncate rounded-md px-2 py-1.5 text-sm',
                nest.id === activeNestId ? 'bg-elevated text-fg' : 'text-fg-muted hover:bg-elevated hover:text-fg',
              )}
            >
              <span className="text-base">{nest.icon}</span>
              <span className="truncate">{nest.name}</span>
            </Link>
          ))
        )}
      </nav>

      <div className="flex items-center justify-between border-t border-border p-3">
        <span className="truncate text-xs text-fg-muted">{user?.name}</span>
        <button onClick={signOut} aria-label="Sign out" className="text-fg-subtle hover:text-fg-muted">
          <LogOut size={15} />
        </button>
      </div>
    </aside>
  )
}
