import { Reply } from 'lucide-react'
import { cn } from '@/lib/cn'
import type { Message, User } from '@/lib/types'

const QUICK_REACTIONS = ['🔥', '💀', '🐍']

interface MessageListProps {
  messages: Message[]
  usersById: Map<string, User>
  currentUserId: string
  onReact: (messageId: string, emoji: string) => void
  onReply: (message: Message) => void
}

export function MessageList({ messages, usersById, currentUserId, onReact, onReply }: MessageListProps) {
  const messagesById = new Map(messages.map((message) => [message.id, message]))

  return (
    <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-4">
      {messages.map((message) => {
        const author = usersById.get(message.authorId)
        const isSelf = message.authorId === currentUserId
        const quoted = message.replyToId ? messagesById.get(message.replyToId) : undefined
        const quotedAuthor = quoted ? usersById.get(quoted.authorId) : undefined

        return (
          <div key={message.id} className={cn('group flex items-end gap-2', isSelf && 'flex-row-reverse')}>
            {!isSelf && <span className="mb-1 text-lg">{author?.avatar ?? '👤'}</span>}

            <div className={cn('flex max-w-[70%] flex-col gap-1', isSelf ? 'items-end' : 'items-start')}>
              {!isSelf && <span className="px-1 text-xs font-medium text-fg-muted">{author?.name ?? 'Unknown'}</span>}

              {quoted && (
                <div className="flex max-w-full items-center gap-1.5 rounded-lg border-l-2 border-border-strong bg-elevated px-2 py-1 text-xs text-fg-subtle">
                  <span>{quotedAuthor?.avatar}</span>
                  <span className="font-medium">{quotedAuthor?.name ?? 'Unknown'}</span>
                  <span className="truncate">{quoted.text}</span>
                </div>
              )}

              <div className="relative">
                <div
                  className={cn(
                    'rounded-2xl px-3.5 py-2 text-sm transition-shadow',
                    isSelf
                      ? 'bg-accent text-accent-fg group-hover:bg-accent-hover'
                      : 'bg-elevated-2 text-fg border border-border-strong group-hover:ring-2 group-hover:ring-accent/30',
                  )}
                >
                  {message.text}
                </div>

                {message.reactions.length > 0 && (
                  <div
                    className={cn(
                      'absolute -bottom-3 flex gap-0.5 rounded-full border border-border bg-panel px-1 py-0.5 shadow-sm',
                      isSelf ? 'right-2' : 'left-2',
                    )}
                  >
                    {message.reactions.map((reaction) => (
                      <button
                        key={reaction.emoji}
                        onClick={() => onReact(message.id, reaction.emoji)}
                        className="flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs hover:bg-elevated"
                      >
                        {reaction.emoji} {reaction.count}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <span className={cn('px-1 text-[11px] text-fg-subtle', message.reactions.length > 0 && 'mt-2')}>
                {message.sentAt}
              </span>
            </div>

            <div className="mb-6 flex items-center gap-0.5 self-center opacity-0 transition-opacity group-hover:opacity-100">
              {QUICK_REACTIONS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => onReact(message.id, emoji)}
                  aria-label={`React with ${emoji}`}
                  className="rounded-full p-1 text-sm hover:bg-elevated"
                >
                  {emoji}
                </button>
              ))}
              <button
                onClick={() => onReply(message)}
                aria-label="Reply"
                className="rounded-full p-1.5 text-fg-muted hover:bg-elevated hover:text-fg"
              >
                <Reply size={14} />
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
