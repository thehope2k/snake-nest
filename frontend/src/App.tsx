import { useState } from 'react'
import { Badge, Button, Field, Input, Toggle } from '@/components/ui'

export default function App() {
  const [doghouseOptOut, setDoghouseOptOut] = useState(false)

  return (
    <main className="mx-auto flex max-w-md flex-col gap-6 p-8">
      <div className="flex items-center gap-2">
        <h1 className="text-lg font-semibold">The Nest</h1>
        <Badge tone="accent">groundwork</Badge>
      </div>

      <Field label="Nest name" hint="What your friends will see">
        <Input placeholder="Snake Pit" />
      </Field>

      <div className="flex items-center justify-between">
        <span className="text-sm text-fg-muted">Opt out of Doghouse</span>
        <Toggle checked={doghouseOptOut} onChange={setDoghouseOptOut} label="Opt out of Doghouse" />
      </div>

      <div className="flex gap-2">
        <Button variant="primary">Create Nest</Button>
        <Button variant="outline">Cancel</Button>
      </div>
    </main>
  )
}
