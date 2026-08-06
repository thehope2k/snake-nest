import type { Message, User } from '@/lib/types'

const QUICK_REACTIONS = ['🔥', '💀', '🐍']

interface MessageListProps {
  messages: Message[]
  usersById: Map<string, User>
  onReact: (messageId: string, emoji: string) => void
}

export function MessageList({ messages, usersById, onReact }: MessageListProps) {
  return (
    <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
      {messages.map((message) => {
        const author = usersById.get(message.authorId)
        return (
          <div key={message.id} className="group flex gap-3">
            <span className="text-xl">{author?.avatar ?? '👤'}</span>
            <div className="flex-1">
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-semibold">{author?.name ?? 'Unknown'}</span>
                <span className="text-xs text-fg-subtle">{message.sentAt}</span>
              </div>
              <p className="text-sm">{message.text}</p>
              <div className="mt-1 flex gap-2">
                {message.reactions.map((reaction) => (
                  <button
                    key={reaction.emoji}
                    onClick={() => onReact(message.id, reaction.emoji)}
                    className="rounded-full bg-elevated px-2 py-0.5 text-xs hover:bg-elevated-2"
                  >
                    {reaction.emoji} {reaction.count}
                  </button>
                ))}
                {QUICK_REACTIONS.filter((emoji) => !message.reactions.some((r) => r.emoji === emoji)).map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => onReact(message.id, emoji)}
                    className="rounded-full px-2 py-0.5 text-xs text-fg-subtle opacity-0 hover:bg-elevated hover:opacity-100 group-hover:opacity-100"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
