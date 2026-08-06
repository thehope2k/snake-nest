import { createContext, useContext } from 'react'
import type { Message, Nest, Participant, User } from './types'

export type DoghouseRejection = 'opted-out' | 'already-benched' | 'on-cooldown' | 'nest-full'

export interface NestStoreValue {
  nests: Nest[]
  nestsLoaded: boolean
  nestsError: string | null
  now: number
  refreshNests: () => Promise<void>
  createNest: (name: string, icon: string) => Promise<Nest>
  joinNest: (code: string) => Promise<Nest>
  startConversation: (participantUserIds: string[]) => Promise<Nest>
  renameNest: (nestId: string, name: string, icon: string) => Promise<Nest>
  searchAllUsers: (query: string) => Promise<User[]>
  membersFor: (nestId: string) => User[]
  loadMembers: (nestId: string) => Promise<void>
  searchUsers: (nestId: string, query: string) => Promise<User[]>
  addMember: (nestId: string, userId: string) => Promise<void>
  removeMember: (nestId: string, userId: string) => Promise<void>
  getInviteCode: (nestId: string) => Promise<string>
  messagesFor: (nestId: string) => Message[]
  loadMessages: (nestId: string) => Promise<void>
  setActiveChatNest: (nestId: string | null) => void
  participantsFor: (nestId: string) => Participant[]
  meetActivityFor: (nestId: string) => number
  sendMessage: (nestId: string, text: string, replyToId?: string | null) => Promise<void>
  addReaction: (nestId: string, messageId: string, emoji: string) => Promise<void>
  sendToDoghouse: (nestId: string, targetUserId: string) => DoghouseRejection | null
  releaseFromDoghouse: (nestId: string, targetUserId: string) => void
  setDoghouseOptOut: (nestId: string, userId: string, optOut: boolean) => void
}

export const NestStoreContext = createContext<NestStoreValue | null>(null)

export function useNestStore(): NestStoreValue {
  const context = useContext(NestStoreContext)
  if (!context) throw new Error('useNestStore must be used within NestStoreProvider')
  return context
}
