import { useEffect } from 'react'
import { CirclePlus, LogOut, MessageSquarePlus, Phone } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { Avatar, Badge, IconButton } from '@/components/ui'
import { CreateNestDialog } from '@/components/nest/CreateNestDialog'
import { NewMessageDialog } from '@/components/nest/NewMessageDialog'
import { useAuth } from '@/lib/auth'
import { useNestStore } from '@/lib/nest-store'
import { useNestActivity } from '@/lib/useNestActivity'
import { nestIdentity } from '@/lib/nest-identity'
import { cn } from '@/lib/cn'

const MAX_UNREAD_DISPLAY = 9

export function NestSidebar() {
  const { user, signOut } = useAuth()
  const { nests, nestsLoaded, nestsError, membersFor, loadMembers, meetActivityFor } = useNestStore()
  const { nestId: activeNestId } = useParams<{ nestId?: string }>()
  const { unreadCountFor } = useNestActivity(activeNestId)

  useEffect(() => {
    nests.filter((nest) => !nest.name).forEach((nest) => loadMembers(nest.id))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nests])

  return (
    <aside className="flex h-full flex-col bg-panel">
      <div className="flex items-center justify-between border-b border-border p-3">
        <span className="text-sm font-semibold">🐍 The Nest</span>
        <div className="flex items-center gap-1">
          <NewMessageDialog
            trigger={
              <IconButton aria-label="New message">
                <MessageSquarePlus size={16} />
              </IconButton>
            }
          />
          <CreateNestDialog
            trigger={
              <IconButton aria-label="Create a Nest">
                <CirclePlus size={16} />
              </IconButton>
            }
          />
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-2">
        {nestsError ? (
          <p className="p-2 text-xs text-doghouse">{nestsError}</p>
        ) : !nestsLoaded ? null : nests.length === 0 ? (
          <p className="p-2 text-xs text-fg-subtle">No Nests yet — create one.</p>
        ) : (
          nests.map((nest) => {
            const identity = nestIdentity(nest, membersFor(nest.id), user?.id ?? '')
            const unreadCount = nest.id === activeNestId ? 0 : unreadCountFor(nest.id)
            const onCallCount = meetActivityFor(nest.id)
            return (
              <Link
                key={nest.id}
                to={`/nests/${nest.id}`}
                className={cn(
                  'flex items-center gap-2 truncate rounded-md px-2 py-1.5 text-sm transition-shadow',
                  nest.id === activeNestId ? 'bg-elevated text-fg shadow-sm' : 'text-fg-muted hover:bg-elevated hover:text-fg',
                )}
              >
                <Avatar name={identity.name} seed={nest.id} emoji={identity.icon} size="sm" />
                <span className="truncate">{identity.name}</span>
                <span className="ml-auto flex shrink-0 items-center gap-1">
                  {onCallCount > 0 && (
                    <Badge tone="success" className="gap-1">
                      <Phone size={11} />
                      {onCallCount}
                    </Badge>
                  )}
                  {unreadCount > 0 && (
                    <Badge tone="accent">{unreadCount > MAX_UNREAD_DISPLAY ? `${MAX_UNREAD_DISPLAY}+` : unreadCount}</Badge>
                  )}
                </span>
              </Link>
            )
          })
        )}
      </nav>

      <div className="flex items-center justify-between border-t border-border p-3">
        <span className="truncate text-xs text-fg-muted">{user?.name}</span>
        <IconButton onClick={signOut} aria-label="Sign out" size="sm">
          <LogOut size={15} />
        </IconButton>
      </div>
    </aside>
  )
}
