import { useEffect } from 'react'
import { LogOut, MessageSquarePlus, Plus } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { CreateNestDialog } from '@/components/nest/CreateNestDialog'
import { NewMessageDialog } from '@/components/nest/NewMessageDialog'
import { useAuth } from '@/lib/auth'
import { useNestStore } from '@/lib/nest-store'
import { nestIdentity } from '@/lib/nest-identity'
import { cn } from '@/lib/cn'

export function NestSidebar() {
  const { user, signOut } = useAuth()
  const { nests, membersFor, loadMembers } = useNestStore()
  const { nestId: activeNestId } = useParams<{ nestId?: string }>()

  useEffect(() => {
    nests.filter((nest) => !nest.name).forEach((nest) => loadMembers(nest.id))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nests])

  return (
    <aside className="flex h-full flex-col bg-panel">
      <div className="flex items-center justify-between border-b border-border p-3">
        <span className="text-sm font-semibold">🐍 The Nest</span>
        <div className="flex items-center gap-2">
          <NewMessageDialog
            trigger={
              <button aria-label="New message" className="text-fg-muted hover:text-fg">
                <MessageSquarePlus size={16} />
              </button>
            }
          />
          <CreateNestDialog
            trigger={
              <button aria-label="Create a Nest" className="text-fg-muted hover:text-fg">
                <Plus size={16} />
              </button>
            }
          />
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-2">
        {nests.length === 0 ? (
          <p className="p-2 text-xs text-fg-subtle">No Nests yet — create one.</p>
        ) : (
          nests.map((nest) => {
            const identity = nestIdentity(nest, membersFor(nest.id), user?.id ?? '')
            return (
              <Link
                key={nest.id}
                to={`/nests/${nest.id}/chat`}
                className={cn(
                  'flex items-center gap-2 truncate rounded-md px-2 py-1.5 text-sm',
                  nest.id === activeNestId ? 'bg-elevated text-fg' : 'text-fg-muted hover:bg-elevated hover:text-fg',
                )}
              >
                <span className="text-base">{identity.icon}</span>
                <span className="truncate">{identity.name}</span>
              </Link>
            )
          })
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
