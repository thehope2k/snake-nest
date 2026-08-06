import { Reply, Sparkles } from 'lucide-react'
import { Avatar, EmojiPicker, EmptyState, IconButton } from '@/components/ui'
import { cn } from '@/lib/cn'
import { groupConsecutiveByAuthor } from '@/lib/chat-grouping'
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
  const groups = groupConsecutiveByAuthor(messages)

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center">
        <EmptyState icon={Sparkles} title="No messages yet" description="Say hi — someone's bound to reply." />
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
      {groups.map((group) => {
        const author = usersById.get(group.authorId)
        const isSelf = group.authorId === currentUserId
        const lastIndex = group.messages.length - 1

        return (
          <div key={group.messages[0].id} className="flex flex-col gap-0.5">
            {!isSelf && <span className="px-9 text-xs font-medium text-fg-muted">{author?.name ?? 'Unknown'}</span>}
            {group.messages.map((message, index) => (
              <MessageRow
                key={message.id}
                message={message}
                author={author}
                isSelf={isSelf}
                showAvatar={index === lastIndex}
                showTimestamp={index === lastIndex}
                quoted={message.replyToId ? messagesById.get(message.replyToId) : undefined}
                quotedAuthor={
                  message.replyToId
                    ? usersById.get(messagesById.get(message.replyToId)?.authorId ?? '')
                    : undefined
                }
                onReact={onReact}
                onReply={onReply}
              />
            ))}
          </div>
        )
      })}
    </div>
  )
}

interface MessageRowProps {
  message: Message
  author: User | undefined
  isSelf: boolean
  showAvatar: boolean
  showTimestamp: boolean
  quoted: Message | undefined
  quotedAuthor: User | undefined
  onReact: (messageId: string, emoji: string) => void
  onReply: (message: Message) => void
}

function MessageRow({ message, author, isSelf, showAvatar, showTimestamp, quoted, quotedAuthor, onReact, onReply }: MessageRowProps) {
  return (
    <div className={cn('group flex items-end gap-2', isSelf && 'flex-row-reverse')}>
      {!isSelf && (
        <Avatar
          name={author?.name ?? 'Unknown'}
          seed={message.authorId}
          emoji={author?.avatar}
          size="sm"
          className={cn('mb-1', !showAvatar && 'invisible')}
        />
      )}

      <div className={cn('flex max-w-[70%] flex-col gap-1', isSelf ? 'items-end' : 'items-start')}>
        {quoted && (
          <div className="flex max-w-full items-center gap-1.5 rounded-lg border-l-2 border-border-strong bg-elevated px-2 py-1 text-xs text-fg-subtle">
            <Avatar name={quotedAuthor?.name ?? 'Unknown'} seed={quoted.authorId} emoji={quotedAuthor?.avatar} size="sm" />
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

        {showTimestamp && (
          <span className={cn('px-1 text-[11px] text-fg-subtle', message.reactions.length > 0 && 'mt-2')}>{message.sentAt}</span>
        )}
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
        <EmojiPicker onSelect={(emoji) => onReact(message.id, emoji)} />
        <IconButton onClick={() => onReply(message)} aria-label="Reply" size="sm" className="rounded-full">
          <Reply size={14} />
        </IconButton>
      </div>
    </div>
  )
}
