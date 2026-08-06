import { useLocalParticipant, useParticipants, useTracks } from '@livekit/components-react'
import { Track } from 'livekit-client'
import { useAuth } from '@/lib/auth'
import { useNestStore, type DoghouseRejection } from '@/lib/nest-store'
import { nestIdentity } from '@/lib/nest-identity'
import { useToasts } from './Toasts'

const REJECTION_COPY: Record<DoghouseRejection, string> = {
  'opted-out': 'They opted out of the Doghouse — respected, no exceptions.',
  'already-benched': 'Already in the Doghouse.',
  'on-cooldown': 'Still on cooldown from last time — no pile-ons.',
  'nest-full': 'Too many people benched already — the room needs someone to talk.',
}

export function useActiveCall(nestId: string) {
  const { user } = useAuth()
  const store = useNestStore()
  const liveParticipants = useParticipants()
  const cameraTracks = useTracks([Track.Source.Camera])
  const { isMicrophoneEnabled, isCameraEnabled, localParticipant } = useLocalParticipant()
  const { toasts, pushToast, dismiss } = useToasts()

  const nest = store.nests.find((n) => n.id === nestId)
  const members = store.membersFor(nestId)
  const usersById = new Map(members.map((member) => [member.id, member]))
  const doghouseByUserId = new Map(store.participantsFor(nestId).map((participant) => [participant.userId, participant]))
  const cameraTrackByIdentity = new Map(cameraTracks.map((track) => [track.participant.identity, track]))
  const identity = nest && user ? nestIdentity(nest, members, user.id) : null
  const isOwner = nest?.ownerId === user?.id

  function handleSendToDoghouse(targetUserId: string) {
    const rejection = store.sendToDoghouse(nestId, targetUserId)
    if (rejection) {
      pushToast(REJECTION_COPY[rejection], 'warning')
      return
    }
    const target = usersById.get(targetUserId)
    pushToast(`Everyone: shh... we're talking about ${target?.name ?? 'them'} 🤫`, 'doghouse')
  }

  return {
    user,
    store,
    nest,
    identity,
    isOwner,
    usersById,
    doghouseByUserId,
    cameraTrackByIdentity,
    liveParticipants,
    isMicrophoneEnabled,
    isCameraEnabled,
    localParticipant,
    toasts,
    dismiss,
    handleSendToDoghouse,
  }
}
