import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import type { Message, Nest, Participant, User } from './types'
import { useAuth } from './auth'
import {
  addMemberRequest,
  createNestRequest,
  getInviteCodeRequest,
  joinNestRequest,
  listMembersRequest,
  listNestsRequest,
  removeMemberRequest,
  renameNestRequest,
  searchAllUsersRequest,
  searchUsersRequest,
  startConversationRequest,
} from './nest-api'
import { listMessagesRequest, sendMessageRequest, toMessage, toggleReactionRequest } from './chat-api'
import { createChatSocket, subscribeToNestChat as subscribeSocket, type ChatEvent } from './chat-socket'
import type { Client, StompSubscription } from '@stomp/stompjs'

export const DOGHOUSE_DURATION_MS = 60_000
const DOGHOUSE_COOLDOWN_MS = 30_000
const MAX_CONCURRENT_DOGHOUSE_RATIO = 0.5
const TICK_INTERVAL_MS = 1_000

export type DoghouseRejection = 'opted-out' | 'already-benched' | 'on-cooldown' | 'nest-full'

interface NestStoreValue {
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
  sendMessage: (nestId: string, text: string, replyToId?: string | null) => Promise<void>
  addReaction: (nestId: string, messageId: string, emoji: string) => Promise<void>
  sendToDoghouse: (nestId: string, targetUserId: string) => DoghouseRejection | null
  releaseFromDoghouse: (nestId: string, targetUserId: string) => void
  setDoghouseOptOut: (nestId: string, userId: string, optOut: boolean) => void
}

const NestStoreContext = createContext<NestStoreValue | null>(null)

const EMPTY_USERS: User[] = []

function maxConcurrentFor(memberCount: number): number {
  return Math.max(1, Math.floor(memberCount * MAX_CONCURRENT_DOGHOUSE_RATIO))
}

function seedParticipants(members: User[]): Participant[] {
  return members.map((member) => ({
    userId: member.id,
    doghouseUntil: null,
    cooldownUntil: null,
    doghouseOptOut: false,
    doghouseCount: 0,
  }))
}

export function NestStoreProvider({ children }: { children: ReactNode }) {
  const { user, token } = useAuth()
  const [nests, setNests] = useState<Nest[]>([])
  const [nestsLoaded, setNestsLoaded] = useState(false)
  const [nestsError, setNestsError] = useState<string | null>(null)
  const [membersByNest, setMembersByNest] = useState<Record<string, User[]>>({})
  const [messagesByNest, setMessagesByNest] = useState<Record<string, Message[]>>({})
  const [participantsByNest, setParticipantsByNest] = useState<Record<string, Participant[]>>({})
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), TICK_INTERVAL_MS)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    setParticipantsByNest((current) => releaseExpired(current, now))
  }, [now])

  const refreshNests = useCallback(async () => {
    if (!token) return
    try {
      setNests(await listNestsRequest(token))
      setNestsError(null)
    } catch (cause) {
      setNestsError(cause instanceof Error ? cause.message : 'Could not load your Nests.')
    } finally {
      setNestsLoaded(true)
    }
  }, [token])

  useEffect(() => {
    if (user && token) refreshNests()
  }, [user, token, refreshNests])

  const chatClientRef = useRef<Client | null>(null)
  const [activeChatNestId, setActiveChatNestId] = useState<string | null>(null)

  useEffect(() => {
    if (!token) return
    const client = createChatSocket(token)
    chatClientRef.current = client
    client.activate()
    return () => {
      client.deactivate()
      chatClientRef.current = null
    }
  }, [token])

  useEffect(() => {
    const client = chatClientRef.current
    if (!client || !activeChatNestId) return

    let subscription: StompSubscription | null = null
    function attach() {
      subscription = subscribeSocket(client!, activeChatNestId!, handleChatEvent)
    }
    if (client.connected) attach()
    client.onConnect = attach

    return () => {
      subscription?.unsubscribe()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChatNestId, token])

  function handleChatEvent(event: ChatEvent) {
    const message = toMessage(event.message as Parameters<typeof toMessage>[0])
    setMessagesByNest((current) => ({
      ...current,
      [message.nestId]: upsertMessage(current[message.nestId] ?? [], message),
    }))
  }

  function setActiveChatNest(nestId: string | null) {
    setActiveChatNestId(nestId)
  }

  function requireToken(): string {
    if (!token) throw new Error('Not signed in')
    return token
  }

  async function createNest(name: string, icon: string): Promise<Nest> {
    const nest = await createNestRequest(requireToken(), name, icon)
    setNests((current) => [...current, nest])
    return nest
  }

  async function joinNest(code: string): Promise<Nest> {
    const nest = await joinNestRequest(requireToken(), code)
    setNests((current) => (current.some((n) => n.id === nest.id) ? current : [...current, nest]))
    return nest
  }

  async function startConversation(participantUserIds: string[]): Promise<Nest> {
    const nest = await startConversationRequest(requireToken(), participantUserIds)
    setNests((current) => (current.some((n) => n.id === nest.id) ? current : [...current, nest]))
    return nest
  }

  async function renameNest(nestId: string, name: string, icon: string): Promise<Nest> {
    const updated = await renameNestRequest(requireToken(), nestId, name, icon)
    setNests((current) => current.map((n) => (n.id === nestId ? updated : n)))
    return updated
  }

  function searchAllUsers(query: string): Promise<User[]> {
    return searchAllUsersRequest(requireToken(), query)
  }

  function membersFor(nestId: string): User[] {
    return membersByNest[nestId] ?? EMPTY_USERS
  }

  async function loadMembers(nestId: string): Promise<void> {
    const members = await listMembersRequest(requireToken(), nestId)
    setMembersByNest((current) => ({ ...current, [nestId]: members }))
    setParticipantsByNest((current) => ({
      ...current,
      [nestId]: syncParticipants(current[nestId] ?? [], members),
    }))
  }

  function searchUsers(nestId: string, query: string): Promise<User[]> {
    return searchUsersRequest(requireToken(), nestId, query)
  }

  async function addMember(nestId: string, userId: string): Promise<void> {
    await addMemberRequest(requireToken(), nestId, userId)
    await loadMembers(nestId)
  }

  async function removeMember(nestId: string, userId: string): Promise<void> {
    await removeMemberRequest(requireToken(), nestId, userId)
    await loadMembers(nestId)
  }

  function getInviteCode(nestId: string): Promise<string> {
    return getInviteCodeRequest(requireToken(), nestId)
  }

  async function loadMessages(nestId: string): Promise<void> {
    const messages = await listMessagesRequest(requireToken(), nestId)
    setMessagesByNest((current) => ({ ...current, [nestId]: messages }))
  }

  function messagesFor(nestId: string): Message[] {
    return messagesByNest[nestId] ?? []
  }

  function participantsFor(nestId: string): Participant[] {
    return participantsByNest[nestId] ?? []
  }

  async function sendMessage(nestId: string, text: string, replyToId: string | null = null): Promise<void> {
    const message = await sendMessageRequest(requireToken(), nestId, text, replyToId)
    setMessagesByNest((current) => ({
      ...current,
      [nestId]: upsertMessage(current[nestId] ?? [], message),
    }))
  }

  async function addReaction(nestId: string, messageId: string, emoji: string): Promise<void> {
    const message = await toggleReactionRequest(requireToken(), messageId, emoji)
    setMessagesByNest((current) => ({
      ...current,
      [nestId]: upsertMessage(current[nestId] ?? [], message),
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
    nestsLoaded,
    nestsError,
    now,
    refreshNests,
    createNest,
    joinNest,
    startConversation,
    renameNest,
    searchAllUsers,
    membersFor,
    loadMembers,
    searchUsers,
    addMember,
    removeMember,
    getInviteCode,
    messagesFor,
    loadMessages,
    setActiveChatNest,
    participantsFor,
    sendMessage,
    addReaction,
    sendToDoghouse,
    releaseFromDoghouse,
    setDoghouseOptOut,
  }

  return <NestStoreContext.Provider value={value}>{children}</NestStoreContext.Provider>
}

function syncParticipants(current: Participant[], members: User[]): Participant[] {
  const memberIds = new Set(members.map((m) => m.id))
  const kept = current.filter((p) => memberIds.has(p.userId))
  const knownIds = new Set(kept.map((p) => p.userId))
  const added = seedParticipants(members.filter((m) => !knownIds.has(m.id)))
  return [...kept, ...added]
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

function upsertMessage(messages: Message[], incoming: Message): Message[] {
  const index = messages.findIndex((m) => m.id === incoming.id)
  if (index === -1) return [...messages, incoming]
  return messages.map((m, i) => (i === index ? incoming : m))
}

export function useNestStore(): NestStoreValue {
  const context = useContext(NestStoreContext)
  if (!context) throw new Error('useNestStore must be used within NestStoreProvider')
  return context
}
