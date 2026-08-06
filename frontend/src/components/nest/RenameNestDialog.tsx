import { useState, type SubmitEvent } from 'react'
import { Avatar, Button, Dialog, DialogContent, DialogTrigger, Field, IconPicker, Input } from '@/components/ui'
import { useNestStore } from '@/lib/nest-store'
import { ApiError } from '@/lib/api-client'
import { NEST_ICONS } from '@/lib/nest-icons'
import type { Nest } from '@/lib/types'

interface RenameNestDialogProps {
  nest: Nest
  suggestedName: string
  onRenamed?: () => void
}

export function RenameNestDialog({ nest, suggestedName, onRenamed }: RenameNestDialogProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(nest.name ?? '')
  const [icon, setIcon] = useState(nest.icon ?? NEST_ICONS[0])
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const { renameNest } = useNestStore()

  function openDialog() {
    setName(nest.name ?? '')
    setIcon(nest.icon ?? NEST_ICONS[0])
    setError(null)
    setOpen(true)
  }

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) {
      setError('Give it a name')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await renameNest(nest.id, trimmed, icon)
      setOpen(false)
      onRenamed?.()
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : 'Something went wrong. Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          onClick={openDialog}
          className="group flex items-center gap-2 rounded-md px-1.5 py-0.5 hover:bg-elevated"
        >
          <Avatar name={nest.name ?? suggestedName} seed={nest.id} emoji={nest.icon ?? '👥'} size="sm" />
          <h1 className="text-base font-semibold">{nest.name ?? suggestedName}</h1>
        </button>
      </DialogTrigger>
      <DialogContent title="Edit conversation name">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="Name" hint={nest.name ? undefined : `Defaults to "${suggestedName}" if left blank`}>
            <Input value={name} onChange={(event) => setName(event.target.value)} placeholder={suggestedName} autoFocus />
          </Field>
          <IconPicker options={NEST_ICONS} value={icon} onChange={setIcon} aria-label="Nest icon" />

          {error && <p className="text-xs text-doghouse">{error}</p>}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
