import { useState, type SubmitEvent } from 'react'
import { Button, Input } from '@/components/ui'

interface ComposerProps {
  onSend: (text: string) => void
}

export function Composer({ onSend }: ComposerProps) {
  const [text, setText] = useState('')

  function handleSubmit(event: SubmitEvent) {
    event.preventDefault()
    const trimmed = text.trim()
    if (!trimmed) return
    onSend(trimmed)
    setText('')
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 border-t border-border p-4">
      <Input
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="Say something you can't take back..."
      />
      <Button type="submit">Send</Button>
    </form>
  )
}
