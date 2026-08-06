import { useEffect, useRef, useState, type UIEvent } from 'react'
import { CornerUpLeft, Reply, Sparkles } from 'lucide-react'
import { Avatar, EmojiPicker, EmptyState, IconButton } from '@/components/ui'
import { cn } from '@/lib/cn'
import { groupConsecutiveByAuthor } from '@/lib/chat-grouping'
import type { Message, User } from '@/lib/types'

const QUICK_REACTIONS = ['🔥', '💀', '🐍']
const HIGHLIGHT_MS = 1_200
const NEAR_BOTTOM_PX = 120

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
  const messageRefs = useRef(new Map<string, HTMLDivElement>())
  const bottomRef = useRef<HTMLDivElement>(null)
  const stickToBottomRef = useRef(true)
  const isFirstScrollRef = useRef(true)
  const [highlightedId, setHighlightedId] = useState<string | null>(null)

  function registerRef(id: string, el: HTMLDivElement | null) {
    if (el) messageRefs.current.set(id, el)
    else messageRefs.current.delete(id)
  }

  function handleScroll(event: UIEvent<HTMLDivElement>) {
    const el = event.currentTarget
    stickToBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < NEAR_BOTTOM_PX
  }

  useEffect(() => {
    if (!stickToBottomRef.current) return
    bottomRef.current?.scrollIntoView({ behavior: isFirstScrollRef.current ? 'auto' : 'smooth' })
    isFirstScrollRef.current = false
    // Only the count matters here — reactions/edits on existing messages shouldn't yank the scroll position.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length])

  function jumpToMessage(id: string) {
    const el = messageRefs.current.get(id)
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    setHighlightedId(id)
    window.setTimeout(() => setHighlightedId((current) => (current === id ? null : current)), HIGHLIGHT_MS)
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center">
        <EmptyState icon={Sparkles} title="No messages yet" description="Say hi — someone's bound to reply." />
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4" onScroll={handleScroll}>
      {groups.map((group) => {
        const author = usersById.get(group.authorId)
        const isSelf = group.authorId === currentUserId
        const lastIndex = group.messages.length - 1

        return (
          <div key={group.messages[0].id} className={cn('flex flex-col gap-0.5', isSelf ? 'items-end' : 'items-start')}>
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
                isHighlighted={highlightedId === message.id}
                registerRef={registerRef}
                onReact={onReact}
                onReply={onReply}
                onJumpTo={jumpToMessage}
              />
            ))}
          </div>
        )
      })}
      <div ref={bottomRef} aria-hidden="true" />
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
  isHighlighted: boolean
  registerRef: (id: string, el: HTMLDivElement | null) => void
  onReact: (messageId: string, emoji: string) => void
  onReply: (message: Message) => void
  onJumpTo: (messageId: string) => void
}

function MessageRow({
  message,
  author,
  isSelf,
  showAvatar,
  showTimestamp,
  quoted,
  quotedAuthor,
  isHighlighted,
  registerRef,
  onReact,
  onReply,
  onJumpTo,
}: MessageRowProps) {
  return (
    <div
      ref={(el) => registerRef(message.id, el)}
      className={cn(
        'flex items-end gap-2 rounded-lg -m-1 p-1 transition-colors duration-slow ease-standard',
        isSelf && 'flex-row-reverse',
        isHighlighted && 'bg-accent/10',
      )}
    >
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
        <div className="group relative">
          <div
            className={cn(
              'rounded-2xl px-3.5 py-2 text-sm transition-shadow',
              isSelf
                ? 'bg-accent text-accent-fg group-hover:bg-accent-hover'
                : 'bg-elevated-2 text-fg border border-border-strong group-hover:ring-2 group-hover:ring-accent/30',
            )}
          >
            {quoted && (
              <button
                type="button"
                onClick={() => onJumpTo(quoted.id)}
                className={cn(
                  'mb-1.5 flex w-full items-center gap-1.5 rounded-md border-l-2 bg-black/15 px-2 py-1 text-left text-xs transition-colors hover:bg-black/25',
                  isSelf ? 'border-accent-fg/30 text-accent-fg/85' : 'border-border-strong text-fg-muted',
                )}
              >
                <CornerUpLeft size={12} className="shrink-0" />
                <span className="shrink-0 font-medium">{quotedAuthor?.name ?? 'Unknown'}</span>
                <span className="truncate">{quoted.text}</span>
              </button>
            )}
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
                  className={cn(
                    'flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs hover:bg-elevated',
                    reaction.reactedByMe && 'bg-accent/15 text-accent',
                  )}
                >
                  {reaction.emoji} {reaction.count}
                </button>
              ))}
            </div>
          )}

          <div
            className={cn(
              'absolute top-1/2 flex -translate-y-1/2 items-center gap-0.5 whitespace-nowrap opacity-0 transition-opacity duration-fast ease-standard group-hover:opacity-100 group-focus-within:opacity-100 pointer-coarse:opacity-100',
              isSelf ? 'right-full mr-2' : 'left-full ml-2',
            )}
          >
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

        {showTimestamp && (
          <span className={cn('px-1 text-[11px] text-fg-subtle', message.reactions.length > 0 && 'mt-2')}>{message.sentAt}</span>
        )}
      </div>
    </div>
  )
}
