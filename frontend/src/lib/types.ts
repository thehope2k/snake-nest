export interface User {
  id: string
  name: string
  avatar: string
  email?: string
}

export interface Nest {
  id: string
  name: string | null
  icon: string | null
  ownerId: string
  memberIds: string[]
}

export interface Reaction {
  emoji: string
  count: number
  reactedByMe: boolean
}

export interface Message {
  id: string
  nestId: string
  authorId: string
  text: string
  sentAt: string
  reactions: Reaction[]
  replyToId: string | null
}

export interface Participant {
  userId: string
  doghouseUntil: number | null
  cooldownUntil: number | null
  doghouseCount: number
}
