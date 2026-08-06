export interface User {
  id: string
  name: string
  avatar: string
}

export interface Nest {
  id: string
  name: string
  icon: string
  ownerId: string
  memberIds: string[]
}

export interface Reaction {
  emoji: string
  count: number
}

export interface Message {
  id: string
  nestId: string
  authorId: string
  text: string
  sentAt: string
  reactions: Reaction[]
}

export interface Participant {
  userId: string
  doghouseUntil: number | null
  cooldownUntil: number | null
  doghouseOptOut: boolean
  doghouseCount: number
}
