import type { Message, Nest, Participant, User } from './types'

export const MOCK_USERS: User[] = [
  { id: 'u-hope', name: 'Hope', avatar: '🧑‍💻' },
  { id: 'u-duy', name: 'Duy', avatar: '🧔' },
  { id: 'u-khoa', name: 'Khoa', avatar: '🧑‍🎓' },
  { id: 'u-ngoc', name: 'Ngoc', avatar: '👩' },
]

export const MOCK_NESTS: Nest[] = [
  {
    id: 'n-snake-pit',
    name: 'The Snake Pit',
    icon: '🐍',
    ownerId: 'u-hope',
    memberIds: ['u-hope', 'u-duy', 'u-khoa', 'u-ngoc'],
  },
  { id: 'n-book-club', name: 'Book Club (lol)', icon: '📚', ownerId: 'u-duy', memberIds: ['u-hope', 'u-duy'] },
]

export const MOCK_MESSAGES: Message[] = [
  {
    id: 'm-1',
    nestId: 'n-snake-pit',
    authorId: 'u-duy',
    text: 'bro lost 3 games in a row and still talking 💀',
    sentAt: '10:41 AM',
    reactions: [{ emoji: '💀', count: 12 }, { emoji: '🐍', count: 4 }],
    replyToId: null,
  },
  {
    id: 'm-2',
    nestId: 'n-snake-pit',
    authorId: 'u-khoa',
    text: 'at least I show up, unlike SOME people',
    sentAt: '10:42 AM',
    reactions: [{ emoji: '🔥', count: 6 }],
    replyToId: 'm-1',
  },
]

export function seedParticipants(nest: Nest): Participant[] {
  return nest.memberIds.map((userId) => ({
    userId,
    doghouseUntil: null,
    cooldownUntil: null,
    doghouseOptOut: false,
    doghouseCount: 0,
  }))
}
