import { useEffect, useRef, useState, type SubmitEvent } from 'react'
import { X } from 'lucide-react'
import { Button, Input } from '@/components/ui'
import type { Message, User } from '@/lib/types'

interface ComposerProps {
  onSend: (text: string) => void
  replyingTo: { message: Message; author: User | undefined } | null
  onCancelReply: () => void
}

export function Composer({ onSend, replyingTo, onCancelReply }: ComposerProps) {
  const [text, setText] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (replyingTo) inputRef.current?.focus()
  }, [replyingTo])

  function handleSubmit(event: SubmitEvent) {
    event.preventDefault()
    const trimmed = text.trim()
    if (!trimmed) return
    onSend(trimmed)
    setText('')
  }

  return (
    <div className="border-t border-border">
      {replyingTo && (
        <div className="flex items-center justify-between gap-2 bg-panel px-4 py-2 text-xs text-fg-muted">
          <span className="truncate">
            Replying to <span className="font-medium text-fg">{replyingTo.author?.name ?? 'Unknown'}</span>:{' '}
            {replyingTo.message.text}
          </span>
          <button onClick={onCancelReply} aria-label="Cancel reply" className="shrink-0 hover:text-fg">
            <X size={14} />
          </button>
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex gap-2 p-4">
        <Input
          ref={inputRef}
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Say something you can't take back..."
        />
        <Button type="submit">Send</Button>
      </form>
    </div>
  )
}
