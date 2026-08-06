import { useCallback, useEffect, useState, type ReactNode } from 'react'
import type { Message, Nest, Participant, User } from './types'
import { useAuth } from './auth-context'
import { NestStoreContext, type DoghouseRejection, type NestStoreValue } from './nest-store-context'
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
import { subscribeToNestChat as subscribeSocket, type ChatEvent } from './chat-socket'
import { listMeetParticipantsRequest } from './meet-api'
import { subscribeToNestMeet, type MeetEvent } from './meet-socket'
import { listDoghouseStateRequest, releaseFromDoghouseRequest, sendToDoghouseRequest, type DoghouseState } from './doghouse-api'
import { useNestSocket } from './nest-socket-context'

// Cosmetic only (the countdown ring in ParticipantTile) -- the server (nest.doghouse.duration-seconds)
// is the actual authority on when a bench really ends; this just has to roughly match its default
// so the ring doesn't look wrong, a real mismatch only skews the visual, never the guardrail.
export const DOGHOUSE_DURATION_MS = 60_000
const TICK_INTERVAL_MS = 1_000

export type { DoghouseRejection }

const EMPTY_USERS: User[] = []

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

  const chatClient = useNestSocket()
  const [activeChatNestId, setActiveChatNestId] = useState<string | null>(null)

  useEffect(() => {
    const { client, connected } = chatClient
    if (!client || !connected || !activeChatNestId) return
    const subscription = subscribeSocket(client, activeChatNestId, handleChatEvent)
    return () => subscription.unsubscribe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChatNestId, chatClient.client, chatClient.connected])

  // Live "is anyone on a call right now" per Nest — subscribed for every Nest you're in, not
  // just the one you're currently viewing, so the sidebar can show it before you switch there.
  const [meetActivityByNest, setMeetActivityByNest] = useState<Record<string, number>>({})

  useEffect(() => {
    const { client, connected } = chatClient
    if (!client || !connected || !token || nests.length === 0) return
    let cancelled = false

    const subscriptions = nests.map((nest) => {
      listMeetParticipantsRequest(token, nest.id)
        .then((participants) => {
          if (cancelled) return
          setMeetActivityByNest((current) => ({ ...current, [nest.id]: participants.length }))
        })
        .catch(() => {
          // Best-effort presence snapshot — the live WS events below still keep it roughly right.
        })

      return subscribeToNestMeet(client, nest.id, (event: MeetEvent) => {
        if (event.type === 'doghouse-started' || event.type === 'doghouse-released') {
          handleDoghouseEvent(nest.id, event)
          return
        }
        const isJoin = event.type === 'participant-joined'
        setMeetActivityByNest((current) => {
          const count = current[nest.id] ?? 0
          const next = isJoin ? count + 1 : Math.max(0, count - 1)
          return { ...current, [nest.id]: next }
        })
      })
    })

    return () => {
      cancelled = true
      subscriptions.forEach((subscription) => subscription.unsubscribe())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nests, chatClient.client, chatClient.connected, token])

  function meetActivityFor(nestId: string): number {
    return meetActivityByNest[nestId] ?? 0
  }

  function handleDoghouseEvent(nestId: string, event: { type: 'doghouse-started' | 'doghouse-released'; targetUserId: string; until: number }) {
    setParticipantsByNest((current) => ({
      ...current,
      [nestId]: (current[nestId] ?? []).map((p) => {
        if (p.userId !== event.targetUserId) return p
        return event.type === 'doghouse-started'
          ? { ...p, doghouseUntil: event.until, doghouseCount: p.doghouseCount + 1 }
          : { ...p, doghouseUntil: null, cooldownUntil: event.until }
      }),
    }))
  }

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
    const [members, doghouseState] = await Promise.all([
      listMembersRequest(requireToken(), nestId),
      listDoghouseStateRequest(requireToken(), nestId),
    ])
    setMembersByNest((current) => ({ ...current, [nestId]: members }))
    setParticipantsByNest((current) => ({
      ...current,
      [nestId]: mergeParticipants(members, doghouseState),
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

  async function sendToDoghouse(nestId: string, targetUserId: string): Promise<DoghouseRejection | null> {
    return sendToDoghouseRequest(requireToken(), nestId, targetUserId)
  }

  async function releaseFromDoghouse(nestId: string, targetUserId: string): Promise<void> {
    await releaseFromDoghouseRequest(requireToken(), nestId, targetUserId)
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
    meetActivityFor,
    sendMessage,
    addReaction,
    sendToDoghouse,
    releaseFromDoghouse,
  }

  return <NestStoreContext.Provider value={value}>{children}</NestStoreContext.Provider>
}

function mergeParticipants(members: User[], state: DoghouseState[]): Participant[] {
  const stateByUserId = new Map(state.map((s) => [s.userId, s]))
  return members.map((member) => {
    const entry = stateByUserId.get(member.id)
    return {
      userId: member.id,
      doghouseUntil: entry?.benchedUntil ?? null,
      cooldownUntil: entry?.cooldownUntil ?? null,
      doghouseCount: entry?.sentCount ?? 0,
    }
  })
}

function upsertMessage(messages: Message[], incoming: Message): Message[] {
  const index = messages.findIndex((m) => m.id === incoming.id)
  if (index === -1) return [...messages, incoming]
  return messages.map((m, i) => (i === index ? incoming : m))
}
