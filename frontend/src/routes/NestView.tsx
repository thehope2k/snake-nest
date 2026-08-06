import { Navigate, useParams } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { Phone, PhoneOff, Users } from 'lucide-react'
import { IconButton } from '@/components/ui'
import { MessageList } from '@/components/chat/MessageList'
import { Composer } from '@/components/chat/Composer'
import { PreJoinDialog } from '@/components/meet/PreJoinDialog'
import { ToastStack, useToasts } from '@/components/meet/Toasts'
import { MembersDialog } from '@/components/nest/MembersDialog'
import { RenameNestDialog } from '@/components/nest/RenameNestDialog'
import { useAuth } from '@/lib/auth'
import { useNestStore } from '@/lib/nest-store'
import { useMeetCall } from '@/lib/meet-call'
import { nestIdentity } from '@/lib/nest-identity'
import type { Message } from '@/lib/types'

export function NestView() {
  const { nestId } = useParams<{ nestId: string }>()
  const { user } = useAuth()
  const store = useNestStore()
  const { activeNestId, status: callStatus, leaveCall } = useMeetCall()
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
  const isInThisCall = activeNestId === nest.id

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
          {isInThisCall ? (
            <IconButton aria-label="Leave call" onClick={() => leaveCall()} className="text-doghouse hover:text-doghouse">
              <PhoneOff size={16} />
            </IconButton>
          ) : (
            <PreJoinDialog
              nestId={nest.id}
              nestName={identity.name}
              trigger={
                <IconButton aria-label="Start a call" disabled={callStatus === 'connecting'}>
                  <Phone size={16} />
                </IconButton>
              }
            />
          )}
        </nav>
      </header>

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

      <ToastStack toasts={toasts} dismiss={dismiss} />
    </div>
  )
}
