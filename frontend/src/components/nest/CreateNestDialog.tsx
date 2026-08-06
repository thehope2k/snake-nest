import { useState, type SubmitEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Dialog, DialogContent, DialogTrigger, Field, Input } from '@/components/ui'
import { useNestStore } from '@/lib/nest-store'

const NEST_ICONS = ['🐍', '📚', '🏋️', '🎮', '🎧']

export function CreateNestDialog() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [icon, setIcon] = useState(NEST_ICONS[0])
  const { createNest } = useNestStore()
  const navigate = useNavigate()

  function handleSubmit(event: SubmitEvent) {
    event.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    const nest = createNest(trimmed, icon)
    setOpen(false)
    setName('')
    navigate(`/nests/${nest.id}/chat`)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create a Nest</Button>
      </DialogTrigger>
      <DialogContent title="Create a Nest">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="Name">
            <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Weekend Crew" autoFocus />
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
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Create</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
