import { useEffect, useState, type ReactNode } from 'react'
import { Check, Copy, MoreHorizontal } from 'lucide-react'
import {
  Button,
  Dialog,
  DialogContent,
  DialogTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Input,
} from '@/components/ui'
import type { Nest, User } from '@/lib/types'
import { useNestStore } from '@/lib/nest-store'
import { ApiError } from '@/lib/api-client'

interface MembersDialogProps {
  nest: Nest
  actorUserId: string
  trigger: ReactNode
  onRejected: (message: string) => void
}

export function MembersDialog({ nest, actorUserId, trigger, onRejected }: MembersDialogProps) {
  const store = useNestStore()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [pendingIds, setPendingIds] = useState<string[]>([])
  const [inviteCode, setInviteCode] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const isOwner = nest.ownerId === actorUserId
  const members = store.membersFor(nest.id)

  useEffect(() => {
    if (!open) return
    store.loadMembers(nest.id)
    store.getInviteCode(nest.id).then(setInviteCode)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, nest.id])

  useEffect(() => {
    if (!open) return
    const trimmed = query.trim()
    if (!trimmed) {
      setSearchResults([])
      return
    }
    const timeout = setTimeout(() => {
      store.searchUsers(nest.id, trimmed).then(setSearchResults)
    }, 200)
    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, open, nest.id])

  async function handleAdd(userId: string) {
    setPendingIds((current) => [...current, userId])
    try {
      await store.addMember(nest.id, userId)
      setSearchResults((current) => current.filter((u) => u.id !== userId))
    } catch (cause) {
      onRejected(cause instanceof ApiError ? cause.message : 'Could not add that person.')
    } finally {
      setPendingIds((current) => current.filter((id) => id !== userId))
    }
  }

  async function handleRemove(userId: string) {
    try {
      await store.removeMember(nest.id, userId)
    } catch (cause) {
      onRejected(cause instanceof ApiError ? cause.message : 'Could not remove that person.')
    }
  }

  function copyInviteCode() {
    if (!inviteCode) return
    navigator.clipboard.writeText(inviteCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent title={`People in ${nest.name}`}>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search people to add..." />
            {query.trim() && (
              <ul className="flex max-h-40 flex-col gap-0.5 overflow-y-auto">
                {searchResults.length === 0 ? (
                  <li className="px-2 py-1.5 text-xs text-fg-subtle">No one matches "{query}".</li>
                ) : (
                  searchResults.map((candidate) => (
                    <li key={candidate.id} className="flex items-center justify-between rounded-md px-2 py-1.5 hover:bg-elevated">
                      <span className="flex items-center gap-2 text-sm">
                        <span className="text-lg">{candidate.avatar}</span>
                        {candidate.name}
                      </span>
                      <Button
                        variant="ghost"
                        disabled={pendingIds.includes(candidate.id)}
                        onClick={() => handleAdd(candidate.id)}
                      >
                        Add
                      </Button>
                    </li>
                  ))
                )}
              </ul>
            )}
          </div>

          <div className="border-t border-border pt-3">
            <p className="mb-1 text-xs text-fg-subtle">{members.length} in this Nest</p>
            <ul className="flex flex-col gap-0.5">
              {members.map((member) => (
                <li
                  key={member.id}
                  className="flex items-center justify-between rounded-md px-2 py-1.5 hover:bg-elevated"
                >
                  <span className="flex items-center gap-2 text-sm">
                    <span className="text-lg">{member.avatar}</span>
                    {member.name}
                    {member.id === nest.ownerId && <span className="text-xs text-fg-subtle">owner</span>}
                  </span>
                  {isOwner && member.id !== nest.ownerId && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button aria-label={`More options for ${member.name}`} className="text-fg-subtle hover:text-fg">
                          <MoreHorizontal size={16} />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem destructive onSelect={() => handleRemove(member.id)}>
                          Remove from Nest
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {inviteCode && (
            <div className="flex items-center justify-between rounded-md border border-border bg-panel px-3 py-2">
              <div>
                <p className="text-xs text-fg-subtle">Invite code</p>
                <p className="font-mono text-sm tracking-wider">{inviteCode}</p>
              </div>
              <button onClick={copyInviteCode} aria-label="Copy invite code" className="text-fg-muted hover:text-fg">
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
