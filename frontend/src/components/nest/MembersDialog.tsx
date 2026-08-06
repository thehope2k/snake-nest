import { useState, type ReactNode } from 'react'
import { MoreHorizontal } from 'lucide-react'
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
import { useNestStore, type RemoveMemberRejection } from '@/lib/nest-store'

const REMOVE_REJECTION_COPY: Record<RemoveMemberRejection, string> = {
  'not-owner': 'Only the Nest owner can remove people.',
  'cannot-remove-owner': "Can't remove the Nest owner.",
}

interface MembersDialogProps {
  nest: Nest
  actorUserId: string
  trigger: ReactNode
  onRejected: (message: string) => void
}

export function MembersDialog({ nest, actorUserId, trigger, onRejected }: MembersDialogProps) {
  const store = useNestStore()
  const [query, setQuery] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const isOwner = nest.ownerId === actorUserId
  const members = nest.memberIds.map((id) => store.users.find((u) => u.id === id)).filter(Boolean) as User[]
  const visibleContacts = store.visibleContactsFor(actorUserId)
  const searchResults = visibleContacts.filter(
    (u) => !nest.memberIds.includes(u.id) && u.name.toLowerCase().includes(query.trim().toLowerCase()),
  )

  function toggleSelected(userId: string) {
    setSelectedIds((current) => (current.includes(userId) ? current.filter((id) => id !== userId) : [...current, userId]))
  }

  function handleAddSelected() {
    selectedIds.forEach((userId) => store.addMember(nest.id, userId))
    setSelectedIds([])
    setQuery('')
  }

  function handleRemove(targetUserId: string) {
    const rejection = store.removeMember(nest.id, actorUserId, targetUserId)
    if (rejection) onRejected(REMOVE_REJECTION_COPY[rejection])
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent title={`People in ${nest.name}`}>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search people you already know..."
            />
            {query.trim() && (
              <ul className="flex max-h-40 flex-col gap-0.5 overflow-y-auto">
                {searchResults.length === 0 ? (
                  <li className="px-2 py-1.5 text-xs text-fg-subtle">
                    No one matches "{query}". You can only add people who already share a Nest with you — invite links
                    for new people are coming soon.
                  </li>
                ) : (
                  searchResults.map((candidate) => (
                    <li key={candidate.id}>
                      <button
                        type="button"
                        onClick={() => toggleSelected(candidate.id)}
                        aria-pressed={selectedIds.includes(candidate.id)}
                        className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm ${
                          selectedIds.includes(candidate.id) ? 'bg-elevated-2' : 'hover:bg-elevated'
                        }`}
                      >
                        <span className="text-lg">{candidate.avatar}</span>
                        {candidate.name}
                      </button>
                    </li>
                  ))
                )}
              </ul>
            )}
            {selectedIds.length > 0 && (
              <Button onClick={handleAddSelected}>
                Add {selectedIds.length} {selectedIds.length === 1 ? 'person' : 'people'}
              </Button>
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
        </div>
      </DialogContent>
    </Dialog>
  )
}
