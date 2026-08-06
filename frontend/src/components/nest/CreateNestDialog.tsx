import { useState, type ReactNode, type SubmitEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { CirclePlus } from 'lucide-react'
import { Button, Dialog, DialogContent, DialogTrigger, Field, Input, Tabs } from '@/components/ui'
import { useNestStore } from '@/lib/nest-store'
import { ApiError } from '@/lib/api-client'
import { NEST_ICONS } from '@/lib/nest-icons'

type Mode = 'create' | 'join'

interface CreateNestDialogProps {
  trigger?: ReactNode
}

export function CreateNestDialog({ trigger }: CreateNestDialogProps) {
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<Mode>('create')
  const [name, setName] = useState('')
  const [icon, setIcon] = useState(NEST_ICONS[0])
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const { createNest, joinNest } = useNestStore()
  const navigate = useNavigate()

  function reset() {
    setName('')
    setCode('')
    setError(null)
    setMode('create')
  }

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const nest = mode === 'create' ? await createNest(name.trim(), icon) : await joinNest(code.trim())
      setOpen(false)
      reset()
      navigate(`/nests/${nest.id}/chat`)
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
      <DialogTrigger asChild>
        {trigger ?? (
          <Button>
            <CirclePlus size={16} />
            Create a Nest
          </Button>
        )}
      </DialogTrigger>
      <DialogContent title={mode === 'create' ? 'Create a Nest' : 'Join a Nest'}>
        <Tabs
          className="mb-4"
          value={mode}
          onValueChange={setMode}
          items={[
            { value: 'create', label: 'Create' },
            { value: 'join', label: 'Join with code' },
          ]}
        />

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {mode === 'create' ? (
            <>
              <Field label="Name">
                <Input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Weekend Crew"
                  autoFocus
                />
              </Field>
              <div className="flex flex-wrap gap-2">
                {NEST_ICONS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setIcon(option)}
                    aria-pressed={icon === option}
                    className={`flex h-9 w-9 items-center justify-center rounded-md border text-lg ${
                      icon === option ? 'border-accent bg-elevated' : 'border-border'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <Field label="Invite code" hint="Ask a member of the Nest for their invite code">
              <Input
                value={code}
                onChange={(event) => setCode(event.target.value.toUpperCase())}
                placeholder="2QCAJWVD"
                autoFocus
              />
            </Field>
          )}

          {error && <p className="text-xs text-doghouse">{error}</p>}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'One sec...' : mode === 'create' ? 'Create' : 'Join'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
