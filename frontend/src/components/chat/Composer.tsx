import { useEffect, useRef, useState, type KeyboardEvent, type SubmitEvent } from 'react'
import { Reply, Send, X } from 'lucide-react'
import { EmojiPicker, IconButton, Textarea } from '@/components/ui'
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

  function insertEmoji(emoji: string) {
    const textarea = textareaRef.current
    if (!textarea) {
      setText((current) => current + emoji)
      return
    }
    const start = textarea.selectionStart ?? text.length
    const end = textarea.selectionEnd ?? text.length
    const next = `${text.slice(0, start)}${emoji}${text.slice(end)}`
    setText(next)
    requestAnimationFrame(() => {
      textarea.focus()
      const caret = start + emoji.length
      textarea.setSelectionRange(caret, caret)
    })
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
        <div className="flex items-center gap-2 border-l-2 border-accent/50 bg-panel px-4 py-2 text-xs text-fg-muted">
          <Reply size={14} className="shrink-0 text-fg-subtle" />
          <span className="truncate">
            Replying to <span className="font-medium text-fg">{replyingTo.author?.name ?? 'Unknown'}</span>:{' '}
            {replyingTo.message.text}
          </span>
          <IconButton onClick={onCancelReply} aria-label="Cancel reply" size="sm" className="ml-auto shrink-0">
            <X size={14} />
          </IconButton>
        </div>
      )}
      <form onSubmit={handleSubmit} className="p-4">
        <div className="flex items-end gap-2 rounded-md border border-border bg-panel px-3 py-3 transition-colors focus-within:border-accent">
          <Textarea
            ref={textareaRef}
            value={text}
            onChange={(event) => setText(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Say something you can't take back..."
            rows={1}
            bare
            style={{ outline: 'none' }}
            className="w-full flex-1 resize-none border-none bg-transparent p-0 text-sm text-fg placeholder:text-fg-subtle"
          />
          <div className="flex shrink-0 items-center gap-1">
            <EmojiPicker onSelect={insertEmoji} align="end" />
            <span className="mx-1 h-5 w-px bg-border" aria-hidden="true" />
            <IconButton
              type="submit"
              aria-label="Send message"
              size="sm"
              disabled={!text.trim()}
              className={text.trim() ? 'text-accent hover:text-accent-hover' : ''}
            >
              <Send size={16} />
            </IconButton>
          </div>
        </div>
      </form>
    </div>
  )
}
