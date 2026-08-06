import { Mic, MicOff } from 'lucide-react'
import { VideoTrack, type TrackReference } from '@livekit/components-react'
import { Avatar, Button, Toggle } from '@/components/ui'
import { cn } from '@/lib/cn'
import { DOGHOUSE_DURATION_MS } from '@/lib/nest-store'
import type { Participant, User } from '@/lib/types'

const MS_PER_SECOND = 1_000

interface ParticipantTileProps {
  user: User
  participant: Participant
  now: number
  isSelf: boolean
  canRelease: boolean
  videoTrackRef?: TrackReference
  onSendToDoghouse: () => void
  onRelease: () => void
  onToggleOptOut: (optOut: boolean) => void
}

export function ParticipantTile({
  user,
  participant,
  now,
  isSelf,
  canRelease,
  videoTrackRef,
  onSendToDoghouse,
  onRelease,
  onToggleOptOut,
}: ParticipantTileProps) {
  const isBenched = Boolean(participant.doghouseUntil && participant.doghouseUntil > now)
  const secondsLeft = isBenched ? Math.ceil((participant.doghouseUntil! - now) / MS_PER_SECOND) : 0
  const percentRemaining = isBenched ? Math.round(((participant.doghouseUntil! - now) / DOGHOUSE_DURATION_MS) * 100) : 0

  return (
    <div
      key={participant.doghouseUntil ?? 'idle'}
      className={cn(
        'relative flex flex-col items-center gap-2 rounded-lg border p-5 text-center shadow-sm transition-[opacity,filter,border-color,box-shadow] duration-slow ease-standard hover:shadow-md',
        isBenched ? 'border-doghouse opacity-60 grayscale animate-doghouse-enter' : 'border-border',
      )}
    >
      {isBenched && <span className="absolute right-3 top-2 text-xs font-semibold text-doghouse">{secondsLeft}s</span>}

      {videoTrackRef ? (
        <div className="relative aspect-video w-full overflow-hidden rounded-md bg-elevated-2">
          <VideoTrack trackRef={videoTrackRef} className={cn('h-full w-full object-cover', isBenched && 'grayscale')} />
          <span className="absolute bottom-1.5 left-1.5 flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-xs font-medium text-white">
            {isBenched ? <MicOff size={12} className="text-doghouse" /> : <Mic size={12} />}
            {user.name}
            {isSelf ? ' (you)' : ''}
          </span>
        </div>
      ) : (
        <>
          {isBenched ? <MicOff size={24} className="text-doghouse" /> : <Mic size={24} className="text-fg-muted" />}
          {isBenched ? (
            <span
              className="rounded-full p-0.5 transition-[background] duration-base"
              style={{ background: `conic-gradient(var(--color-doghouse) ${percentRemaining}%, transparent ${percentRemaining}%)` }}
            >
              <Avatar name={user.name} seed={user.id} emoji={user.avatar} size="lg" />
            </span>
          ) : (
            <Avatar name={user.name} seed={user.id} emoji={user.avatar} size="lg" />
          )}
          <span className="text-sm font-medium">
            {user.name}
            {isSelf ? ' (you)' : ''}
          </span>
        </>
      )}

      {isBenched ? (
        <span className="text-xs font-semibold text-doghouse">🐕 in the doghouse</span>
      ) : (
        <span className="text-xs text-fg-subtle">sent {participant.doghouseCount}x</span>
      )}

      {!isSelf && !isBenched && (
        <Button variant="ghost" className="h-auto p-0 text-xs" onClick={onSendToDoghouse}>
          send to Doghouse
        </Button>
      )}

      {isBenched && canRelease && (
        <Button variant="ghost" className="h-auto p-0 text-xs" onClick={onRelease}>
          release early (owner)
        </Button>
      )}

      {isSelf && (
        <label className="mt-1 flex items-center gap-2 text-xs text-fg-subtle">
          opt out of Doghouse
          <Toggle checked={participant.doghouseOptOut} onChange={onToggleOptOut} label="Opt out of Doghouse" />
        </label>
      )}
    </div>
  )
}
