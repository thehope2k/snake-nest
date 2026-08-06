import { Navigate, Link, useParams } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { Users } from 'lucide-react'
import { IconButton, tabTriggerClass } from '@/components/ui'
import { MessageList } from '@/components/chat/MessageList'
import { Composer } from '@/components/chat/Composer'
import { ParticipantTile } from '@/components/meet/ParticipantTile'
import { ToastStack, useToasts } from '@/components/meet/Toasts'
import { MembersDialog } from '@/components/nest/MembersDialog'
import { RenameNestDialog } from '@/components/nest/RenameNestDialog'
import { useAuth } from '@/lib/auth'
import { useNestStore, type DoghouseRejection } from '@/lib/nest-store'
import { nestIdentity } from '@/lib/nest-identity'
import { cn } from '@/lib/cn'
import type { Message } from '@/lib/types'

const REJECTION_COPY: Record<DoghouseRejection, string> = {
  'opted-out': 'They opted out of the Doghouse — respected, no exceptions.',
  'already-benched': 'Already in the Doghouse.',
  'on-cooldown': 'Still on cooldown from last time — no pile-ons.',
  'nest-full': 'Too many people benched already — the room needs someone to talk.',
}

export function NestView() {
  const { nestId, view = 'chat' } = useParams<{ nestId: string; view?: string }>()
  const { user } = useAuth()
  const store = useNestStore()
  const { toasts, pushToast, dismiss } = useToasts()
  const [replyingTo, setReplyingTo] = useState<Message | null>(null)

  const nest = store.nests.find((n) => n.id === nestId)
  const members = store.membersFor(nestId ?? '')
  const usersById = useMemo(() => new Map(members.map((u) => [u.id, u])), [members])

  useEffect(() => {
    setReplyingTo(null)
  }, [nestId])

  useEffect(() => {
    if (nestId) store.loadMembers(nestId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nestId])

  useEffect(() => {
    if (!nestId) return
    store.loadMessages(nestId)
    store.setActiveChatNest(nestId)
    return () => store.setActiveChatNest(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nestId])

  if (!user) return <Navigate to="/nests" replace />
  if (!nest) {
    if (!store.nestsLoaded) return null
    return <Navigate to="/nests" replace />
  }

  const identity = nestIdentity(nest, members, user.id)
  const messages = store.messagesFor(nest.id)
  const participants = store.participantsFor(nest.id)
  const isOwner = nest.ownerId === user.id

  function handleSendToDoghouse(targetUserId: string) {
    const rejection = store.sendToDoghouse(nest!.id, targetUserId)
    if (rejection) {
      pushToast(REJECTION_COPY[rejection], 'warning')
      return
    }
    const target = usersById.get(targetUserId)
    pushToast(`Everyone: shh... we're talking about ${target?.name ?? 'them'} 🤫`, 'doghouse')
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <header className="flex items-center gap-4 border-b border-border p-4">
        <RenameNestDialog nest={nest} suggestedName={identity.name} />
        <nav className="ml-auto flex items-center gap-3">
          <MembersDialog
            nest={nest}
            actorUserId={user.id}
            onRejected={(message) => pushToast(message, 'warning')}
            trigger={
              <IconButton aria-label="View people" size="sm" className="w-auto gap-1 px-1.5">
                <Users size={16} />
                <span className="text-xs">{members.length || nest.memberIds.length}</span>
              </IconButton>
            }
          />
          <span className="h-5 w-px bg-border" aria-hidden="true" />
          <div className="flex gap-1">
            <TabLink nestId={nest.id} view="chat" active={view === 'chat'} label="Chat" />
            <TabLink nestId={nest.id} view="meet" active={view === 'meet'} label="Meet" />
          </div>
        </nav>
      </header>

      {view === 'meet' ? (
        <div className="grid flex-1 grid-cols-2 gap-4 content-start overflow-y-auto p-6 sm:grid-cols-3">
          {participants.map((participant) => {
            const participantUser = usersById.get(participant.userId)
            if (!participantUser) return null
            return (
              <ParticipantTile
                key={participant.userId}
                user={participantUser}
                participant={participant}
                now={store.now}
                isSelf={participant.userId === user.id}
                canRelease={isOwner}
                onSendToDoghouse={() => handleSendToDoghouse(participant.userId)}
                onRelease={() => store.releaseFromDoghouse(nest.id, participant.userId)}
                onToggleOptOut={(optOut) => store.setDoghouseOptOut(nest.id, participant.userId, optOut)}
              />
            )
          })}
        </div>
      ) : (
        <>
          <MessageList
            messages={messages}
            usersById={usersById}
            currentUserId={user.id}
            onReact={(messageId, emoji) => store.addReaction(nest.id, messageId, emoji)}
            onReply={setReplyingTo}
          />
          <Composer
            onSend={(text) => {
              store.sendMessage(nest.id, text, replyingTo?.id ?? null)
              setReplyingTo(null)
            }}
            replyingTo={replyingTo ? { message: replyingTo, author: usersById.get(replyingTo.authorId) } : null}
            onCancelReply={() => setReplyingTo(null)}
          />
        </>
      )}

      <ToastStack toasts={toasts} dismiss={dismiss} />
    </div>
  )
}

function TabLink({ nestId, view, active, label }: { nestId: string; view: string; active: boolean; label: string }) {
  return (
    <Link to={`/nests/${nestId}/${view}`} className={cn('flex-1', tabTriggerClass(active))}>
      {label}
    </Link>
  )
}
