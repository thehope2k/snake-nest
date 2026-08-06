import { useEffect, useRef, useState, type KeyboardEvent, type SubmitEvent } from 'react'
import { X } from 'lucide-react'
import { Button, IconButton, Textarea } from '@/components/ui'
import type { Message, User } from '@/lib/types'

const MAX_ROWS = 6

interface ComposerProps {
  onSend: (text: string) => void
  replyingTo: { message: Message; author: User | undefined } | null
  onCancelReply: () => void
}

export function Composer({ onSend, replyingTo, onCancelReply }: ComposerProps) {
  const [text, setText] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (replyingTo) textareaRef.current?.focus()
  }, [replyingTo])

  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return
    textarea.style.height = 'auto'
    const maxHeight = MAX_ROWS * Number.parseFloat(getComputedStyle(textarea).lineHeight)
    textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`
  }, [text])

  function send() {
    const trimmed = text.trim()
    if (!trimmed) return
    onSend(trimmed)
    setText('')
  }

  function handleSubmit(event: SubmitEvent) {
    event.preventDefault()
    send()
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      send()
    }
  }

  return (
    <div className="border-t border-border">
      {replyingTo && (
        <div className="flex items-center justify-between gap-2 bg-panel px-4 py-2 text-xs text-fg-muted">
          <span className="truncate">
            Replying to <span className="font-medium text-fg">{replyingTo.author?.name ?? 'Unknown'}</span>:{' '}
            {replyingTo.message.text}
          </span>
          <IconButton onClick={onCancelReply} aria-label="Cancel reply" size="sm" className="shrink-0">
            <X size={14} />
          </IconButton>
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex items-end gap-2 p-4">
        <Textarea
          ref={textareaRef}
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Say something you can't take back..."
          rows={1}
          className="resize-none"
        />
        <Button type="submit">Send</Button>
      </form>
    </div>
  )
}
