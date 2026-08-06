import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Message, Nest, Participant, Reaction } from './types'
import { MOCK_MESSAGES, MOCK_NESTS, MOCK_USERS, seedParticipants } from './mock-data'
import { useAuth } from './mock-auth'

const DOGHOUSE_DURATION_MS = 60_000
const DOGHOUSE_COOLDOWN_MS = 30_000
const MAX_CONCURRENT_DOGHOUSE_RATIO = 0.5
const TICK_INTERVAL_MS = 1_000

export type DoghouseRejection = 'opted-out' | 'already-benched' | 'on-cooldown' | 'nest-full'

interface NestStoreValue {
  nests: Nest[]
  users: typeof MOCK_USERS
  now: number
  messagesFor: (nestId: string) => Message[]
  participantsFor: (nestId: string) => Participant[]
  createNest: (name: string, icon: string) => Nest
  sendMessage: (nestId: string, authorId: string, text: string) => void
  addReaction: (nestId: string, messageId: string, emoji: string) => void
  sendToDoghouse: (nestId: string, targetUserId: string) => DoghouseRejection | null
  releaseFromDoghouse: (nestId: string, targetUserId: string) => void
  setDoghouseOptOut: (nestId: string, userId: string, optOut: boolean) => void
}

const NestStoreContext = createContext<NestStoreValue | null>(null)

function maxConcurrentFor(memberCount: number): number {
  return Math.max(1, Math.floor(memberCount * MAX_CONCURRENT_DOGHOUSE_RATIO))
}

export function NestStoreProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [nests, setNests] = useState<Nest[]>(MOCK_NESTS)
  const [messagesByNest, setMessagesByNest] = useState<Record<string, Message[]>>(() =>
    Object.fromEntries(MOCK_NESTS.map((nest) => [nest.id, MOCK_MESSAGES.filter((m) => m.nestId === nest.id)])),
  )
  const [participantsByNest, setParticipantsByNest] = useState<Record<string, Participant[]>>(() =>
    Object.fromEntries(MOCK_NESTS.map((nest) => [nest.id, seedParticipants(nest)])),
  )
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), TICK_INTERVAL_MS)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    setParticipantsByNest((current) => releaseExpired(current, now))
  }, [now])

  useEffect(() => {
    if (!user) return
    setNests((current) => joinCurrentUser(current, user.id))
    setParticipantsByNest((current) => addUserToAllParticipants(current, user.id))
  }, [user])

  function messagesFor(nestId: string): Message[] {
    return messagesByNest[nestId] ?? []
  }

  function participantsFor(nestId: string): Participant[] {
    return participantsByNest[nestId] ?? []
  }

  function createNest(name: string, icon: string): Nest {
    if (!user) throw new Error('createNest requires a signed-in user')
    const nest: Nest = { id: crypto.randomUUID(), name, icon, ownerId: user.id, memberIds: [user.id] }
    setNests((current) => [...current, nest])
    setMessagesByNest((current) => ({ ...current, [nest.id]: [] }))
    setParticipantsByNest((current) => ({ ...current, [nest.id]: seedParticipants(nest) }))
    return nest
  }

  function sendMessage(nestId: string, authorId: string, text: string) {
    const message: Message = {
      id: crypto.randomUUID(),
      nestId,
      authorId,
      text,
      sentAt: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
      reactions: [],
    }
    setMessagesByNest((current) => ({ ...current, [nestId]: [...(current[nestId] ?? []), message] }))
  }

  function addReaction(nestId: string, messageId: string, emoji: string) {
    setMessagesByNest((current) => ({
      ...current,
      [nestId]: (current[nestId] ?? []).map((message) =>
        message.id === messageId ? { ...message, reactions: bumpReaction(message.reactions, emoji) } : message,
      ),
    }))
  }

  function sendToDoghouse(nestId: string, targetUserId: string): DoghouseRejection | null {
    const participants = participantsFor(nestId)
    const target = participants.find((p) => p.userId === targetUserId)
    if (!target) return null
    if (target.doghouseOptOut) return 'opted-out'
    if (target.doghouseUntil && target.doghouseUntil > now) return 'already-benched'
    if (target.cooldownUntil && target.cooldownUntil > now) return 'on-cooldown'

    const currentlyBenched = participants.filter((p) => p.doghouseUntil && p.doghouseUntil > now).length
    if (currentlyBenched >= maxConcurrentFor(participants.length)) return 'nest-full'

    setParticipantsByNest((current) => ({
      ...current,
      [nestId]: (current[nestId] ?? []).map((p) =>
        p.userId === targetUserId
          ? { ...p, doghouseUntil: now + DOGHOUSE_DURATION_MS, doghouseCount: p.doghouseCount + 1 }
          : p,
      ),
    }))
    return null
  }

  function releaseFromDoghouse(nestId: string, targetUserId: string) {
    setParticipantsByNest((current) => ({
      ...current,
      [nestId]: (current[nestId] ?? []).map((p) =>
        p.userId === targetUserId ? { ...p, doghouseUntil: null, cooldownUntil: now + DOGHOUSE_COOLDOWN_MS } : p,
      ),
    }))
  }

  function setDoghouseOptOut(nestId: string, userId: string, optOut: boolean) {
    setParticipantsByNest((current) => ({
      ...current,
      [nestId]: (current[nestId] ?? []).map((p) => (p.userId === userId ? { ...p, doghouseOptOut: optOut } : p)),
    }))
  }

  const value: NestStoreValue = {
    nests,
    users: MOCK_USERS,
    now,
    messagesFor,
    participantsFor,
    createNest,
    sendMessage,
    addReaction,
    sendToDoghouse,
    releaseFromDoghouse,
    setDoghouseOptOut,
  }

  return <NestStoreContext.Provider value={value}>{children}</NestStoreContext.Provider>
}

function releaseExpired(byNest: Record<string, Participant[]>, now: number): Record<string, Participant[]> {
  let changed = false
  const next = Object.fromEntries(
    Object.entries(byNest).map(([nestId, participants]) => {
      const updated = participants.map((p) => {
        if (p.doghouseUntil && p.doghouseUntil <= now) {
          changed = true
          return { ...p, doghouseUntil: null, cooldownUntil: now + DOGHOUSE_COOLDOWN_MS }
        }
        return p
      })
      return [nestId, updated]
    }),
  )
  return changed ? next : byNest
}

function joinCurrentUser(nests: Nest[], userId: string): Nest[] {
  return nests.map((nest) =>
    nest.memberIds.includes(userId) ? nest : { ...nest, memberIds: [...nest.memberIds, userId] },
  )
}

function addUserToAllParticipants(byNest: Record<string, Participant[]>, userId: string): Record<string, Participant[]> {
  return Object.fromEntries(
    Object.entries(byNest).map(([nestId, participants]) => {
      if (participants.some((p) => p.userId === userId)) return [nestId, participants]
      const joined: Participant = { userId, doghouseUntil: null, cooldownUntil: null, doghouseOptOut: false, doghouseCount: 0 }
      return [nestId, [...participants, joined]]
    }),
  )
}

function bumpReaction(reactions: Reaction[], emoji: string): Reaction[] {
  const existing = reactions.find((r) => r.emoji === emoji)
  if (!existing) return [...reactions, { emoji, count: 1 }]
  return reactions.map((r) => (r.emoji === emoji ? { ...r, count: r.count + 1 } : r))
}

export function useNestStore(): NestStoreValue {
  const context = useContext(NestStoreContext)
  if (!context) throw new Error('useNestStore must be used within NestStoreProvider')
  return context
}
