import { Dog, DoorOpen, Mic, MicOff } from 'lucide-react'
import { VideoTrack, type TrackReference } from '@livekit/components-react'
import { Avatar, IconButton, Tooltip } from '@/components/ui'
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
}: ParticipantTileProps) {
  const isBenched = Boolean(participant.doghouseUntil && participant.doghouseUntil > now)
  const secondsLeft = isBenched ? Math.ceil((participant.doghouseUntil! - now) / MS_PER_SECOND) : 0
  const benchedPercentRemaining = isBenched
    ? Math.round(((participant.doghouseUntil! - now) / DOGHOUSE_DURATION_MS) * 100)
    : 0

  return (
    <div
      className={cn(
        'relative aspect-video w-full max-h-full overflow-hidden rounded-lg border bg-elevated-2 transition-[opacity,filter,border-color] duration-slow ease-standard',
        isBenched ? 'border-doghouse opacity-60 grayscale animate-doghouse-enter' : 'border-border',
      )}
    >
      {videoTrackRef ? (
        <VideoTrack trackRef={videoTrackRef} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full items-center justify-center">
          {isBenched ? (
            <span
              className="rounded-full p-0.5 transition-[background] duration-base"
              style={{ background: `conic-gradient(var(--color-doghouse) ${benchedPercentRemaining}%, transparent ${benchedPercentRemaining}%)` }}
            >
              <Avatar name={user.name} seed={user.id} emoji={user.avatar} size="lg" />
            </span>
          ) : (
            <Avatar name={user.name} seed={user.id} emoji={user.avatar} size="lg" />
          )}
        </div>
      )}

      <span className="absolute left-1.5 top-1.5 rounded-full bg-black/60 px-2 py-0.5 text-xs font-medium text-white">
        {isBenched ? `${secondsLeft}s in the doghouse` : `sent ${participant.doghouseCount}x`}
      </span>

      <span className="absolute bottom-1.5 left-1.5 flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-xs font-medium text-white">
        {isBenched ? <MicOff size={12} className="text-doghouse" /> : <Mic size={12} />}
        {user.name}
        {isSelf ? ' (you)' : ''}
      </span>

      <div className="absolute bottom-1.5 right-1.5 flex items-center gap-1">
        {!isSelf && !isBenched && (
          <Tooltip label="Send to Doghouse">
            <IconButton aria-label="Send to Doghouse" size="md" className="bg-black/60 text-white hover:bg-black/80" onClick={onSendToDoghouse}>
              <Dog size={18} />
            </IconButton>
          </Tooltip>
        )}

        {isBenched && canRelease && (
          <Tooltip label="Release early (owner)">
            <IconButton aria-label="Release early (owner)" size="sm" className="bg-black/60 text-white hover:bg-black/80" onClick={onRelease}>
              <DoorOpen size={14} />
            </IconButton>
          </Tooltip>
        )}
      </div>
    </div>
  )
}
