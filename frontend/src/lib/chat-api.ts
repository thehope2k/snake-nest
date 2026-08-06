import { apiRequest } from './api-client'
import type { Message, Reaction } from './types'

interface ReactionDto {
  emoji: string
  count: number
  reactedByMe: boolean
}

interface MessageDto {
  id: string
  nestId: string
  authorId: string
  text: string
  replyToId: string | null
  createdAt: string
  reactions: ReactionDto[]
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

function toReaction(dto: ReactionDto): Reaction {
  return { emoji: dto.emoji, count: dto.count, reactedByMe: dto.reactedByMe }
}

export function toMessage(dto: MessageDto): Message {
  return {
    id: dto.id,
    nestId: dto.nestId,
    authorId: dto.authorId,
    text: dto.text,
    replyToId: dto.replyToId,
    sentAt: formatTime(dto.createdAt),
    reactions: dto.reactions.map(toReaction),
  }
}

export function listMessagesRequest(token: string, nestId: string): Promise<Message[]> {
  return apiRequest<MessageDto[]>(`/nests/${nestId}/messages`, { token }).then((messages) => messages.map(toMessage))
}

export function sendMessageRequest(
  token: string,
  nestId: string,
  text: string,
  replyToId: string | null,
): Promise<Message> {
  return apiRequest<MessageDto>(`/nests/${nestId}/messages`, {
    method: 'POST',
    token,
    body: { text, replyToId },
  }).then(toMessage)
}

export function toggleReactionRequest(token: string, messageId: string, emoji: string): Promise<Message> {
  return apiRequest<MessageDto>(`/messages/${messageId}/reactions`, {
    method: 'POST',
    token,
    body: { emoji },
  }).then(toMessage)
}
