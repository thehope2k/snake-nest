import { useEffect, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Avatar, Button, Dialog, DialogContent, DialogTrigger, Input } from '@/components/ui'
import { useNestStore } from '@/lib/nest-store-context'
import { ApiError } from '@/lib/api-client'
import type { User } from '@/lib/types'

interface NewMessageDialogProps {
  trigger: ReactNode
}

export function NewMessageDialog({ trigger }: NewMessageDialogProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<User[]>([])
  const [selected, setSelected] = useState<User[]>([])
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const { searchAllUsers, startConversation } = useNestStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (!open) return
    const trimmed = query.trim()
    if (!trimmed) {
      setResults([])
      return
    }
    const timeout = setTimeout(() => {
      searchAllUsers(trimmed).then((users) => setResults(users.filter((u) => !selected.some((s) => s.id === u.id))))
    }, 200)
    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, open])

  function reset() {
    setQuery('')
    setResults([])
    setSelected([])
    setError(null)
  }

  function toggleSelect(candidate: User) {
    setSelected((current) =>
      current.some((u) => u.id === candidate.id) ? current.filter((u) => u.id !== candidate.id) : [...current, candidate],
    )
  }

  async function handleStart() {
    if (selected.length === 0) return
    setSubmitting(true)
    setError(null)
    try {
      const nest = await startConversation(selected.map((u) => u.id))
      setOpen(false)
      reset()
      navigate(`/nests/${nest.id}`)
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : 'Something went wrong. Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) reset()
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent title="New message">
        <div className="flex flex-col gap-3">
          {selected.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {selected.map((person) => (
                <button
                  key={person.id}
                  onClick={() => toggleSelect(person)}
                  className="flex items-center gap-1 rounded-full bg-elevated-2 px-2 py-1 text-xs hover:bg-elevated"
                >
                  <Avatar name={person.name} seed={person.id} emoji={person.avatar} size="sm" />
                  {person.name}
                  <span className="text-fg-subtle">×</span>
                </button>
              ))}
            </div>
          )}

          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search people..." autoFocus />

          {query.trim() && (
            <ul className="flex max-h-48 flex-col gap-0.5 overflow-y-auto">
              {results.length === 0 ? (
                <li className="px-2 py-1.5 text-xs text-fg-subtle">No one matches "{query}".</li>
              ) : (
                results.map((candidate) => (
                  <li key={candidate.id}>
                    <button
                      type="button"
                      onClick={() => toggleSelect(candidate)}
                      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-elevated"
                    >
                      <Avatar name={candidate.name} seed={candidate.id} emoji={candidate.avatar} size="sm" />
                      {candidate.name}
                    </button>
                  </li>
                ))
              )}
            </ul>
          )}

          {error && <p className="text-xs text-doghouse">{error}</p>}

          <Button onClick={handleStart} disabled={selected.length === 0 || submitting}>
            {submitting ? 'One sec...' : selected.length > 1 ? `Start group (${selected.length})` : 'Message'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
