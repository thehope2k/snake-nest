import { Mic, MicOff } from 'lucide-react'
import { Toggle } from '@/components/ui'
import type { Participant, User } from '@/lib/types'

const MS_PER_SECOND = 1_000

interface ParticipantTileProps {
  user: User
  participant: Participant
  now: number
  isSelf: boolean
  canRelease: boolean
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
  onSendToDoghouse,
  onRelease,
  onToggleOptOut,
}: ParticipantTileProps) {
  const isBenched = Boolean(participant.doghouseUntil && participant.doghouseUntil > now)
  const secondsLeft = isBenched ? Math.ceil((participant.doghouseUntil! - now) / MS_PER_SECOND) : 0

  return (
    <div
      className={`relative flex flex-col items-center gap-2 rounded-lg border p-5 text-center transition-opacity ${
        isBenched ? 'border-doghouse opacity-60 grayscale' : 'border-border'
      }`}
    >
      {isBenched && <span className="absolute right-3 top-2 text-xs font-semibold text-doghouse">{secondsLeft}s</span>}
      {isBenched ? <MicOff size={24} className="text-doghouse" /> : <Mic size={24} className="text-fg-muted" />}
      <span className="text-4xl">{user.avatar}</span>
      <span className="text-sm font-medium">
        {user.name}
        {isSelf ? ' (you)' : ''}
      </span>

      {isBenched ? (
        <span className="text-xs font-semibold text-doghouse">🐕 in the doghouse</span>
      ) : (
        <span className="text-xs text-fg-subtle">sent {participant.doghouseCount}x</span>
      )}

      {!isSelf && !isBenched && (
        <button onClick={onSendToDoghouse} className="text-xs text-fg-muted hover:text-accent">
          send to Doghouse
        </button>
      )}

      {isBenched && canRelease && (
        <button onClick={onRelease} className="text-xs text-fg-muted hover:text-accent">
          release early (owner)
        </button>
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
