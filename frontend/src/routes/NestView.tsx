import { Navigate, Link, useParams } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { Users } from 'lucide-react'
import { MessageList } from '@/components/chat/MessageList'
import { Composer } from '@/components/chat/Composer'
import { ParticipantTile } from '@/components/meet/ParticipantTile'
import { ToastStack, useToasts } from '@/components/meet/Toasts'
import { MembersDialog } from '@/components/nest/MembersDialog'
import { useAuth } from '@/lib/mock-auth'
import { useNestStore, type DoghouseRejection } from '@/lib/nest-store'
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
  const usersById = useMemo(() => new Map(store.users.map((u) => [u.id, u])), [store.users])

  useEffect(() => {
    setReplyingTo(null)
  }, [nestId])

  if (!nest || !user) return <Navigate to="/nests" replace />

  const messages = store.messagesFor(nest.id)
  const participants = store.participantsFor(nest.id)
  const isOwner = nest.ownerId === user.id

  function handleSendToDoghouse(targetUserId: string) {
    const rejection = store.sendToDoghouse(nest!.id, targetUserId)
    if (rejection) {
      pushToast(REJECTION_COPY[rejection])
      return
    }
    const target = usersById.get(targetUserId)
    pushToast(`🐍 Everyone: shh... we're talking about ${target?.name ?? 'them'} 🤫`)
  }

  return (
    <div className="flex min-h-full flex-col">
      <header className="flex items-center gap-3 border-b border-border p-4">
        <span className="text-xl">{nest.icon}</span>
        <h1 className="text-base font-semibold">{nest.name}</h1>
        <nav className="ml-auto flex items-center gap-3">
          <MembersDialog
            nest={nest}
            actorUserId={user.id}
            onRejected={pushToast}
            trigger={
              <button aria-label="View people" className="flex items-center gap-1 text-fg-muted hover:text-fg">
                <Users size={16} />
                <span className="text-xs">{nest.memberIds.length}</span>
              </button>
            }
          />
          <div className="flex gap-1">
            <TabLink nestId={nest.id} view="chat" active={view === 'chat'} label="Chat" />
            <TabLink nestId={nest.id} view="meet" active={view === 'meet'} label="Meet" />
          </div>
        </nav>
      </header>

      {view === 'meet' ? (
        <div className="grid flex-1 grid-cols-2 gap-4 content-start p-6 sm:grid-cols-3">
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
              store.sendMessage(nest.id, user.id, text, replyingTo?.id ?? null)
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
    <Link
      to={`/nests/${nestId}/${view}`}
      className={`rounded-md px-3 py-1.5 text-sm ${active ? 'bg-elevated text-fg' : 'text-fg-muted hover:text-fg'}`}
    >
      {label}
    </Link>
  )
}
