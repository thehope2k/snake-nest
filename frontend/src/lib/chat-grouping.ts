import type { Message } from './types'

export interface MessageGroup {
  authorId: string
  messages: Message[]
}

// A reply breaks the run since it needs its own quoted-preview block above the bubble.
export function groupConsecutiveByAuthor(messages: Message[]): MessageGroup[] {
  const groups: MessageGroup[] = []
  for (const message of messages) {
    const lastGroup = groups[groups.length - 1]
    const continuesRun = lastGroup && lastGroup.authorId === message.authorId && !message.replyToId
    if (continuesRun) {
      lastGroup.messages.push(message)
    } else {
      groups.push({ authorId: message.authorId, messages: [message] })
    }
  }
  return groups
}
