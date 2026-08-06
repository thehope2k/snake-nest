import { cn } from '@/lib/cn'

export type AvatarSize = 'sm' | 'md' | 'lg'

const SIZE_CLASSES: Record<AvatarSize, string> = {
  sm: 'h-6 w-6 text-xs',
  md: 'h-8 w-8 text-sm',
  lg: 'h-12 w-12 text-lg',
}

const HUE_HASH_MULTIPLIER = 31
const HUE_RANGE_DEGREES = 360
const AVATAR_LIGHTNESS = 0.6
const AVATAR_CHROMA = 0.13

export interface AvatarProps {
  name: string
  seed: string
  emoji?: string
  imageUrl?: string
  size?: AvatarSize
  className?: string
}

function hueFromSeed(seed: string): number {
  let hash = 0
  for (const char of seed) {
    hash = (hash * HUE_HASH_MULTIPLIER + char.charCodeAt(0)) % HUE_RANGE_DEGREES
  }
  return hash
}

function initialsFromName(name: string): string {
  const [first, second] = name.trim().split(/\s+/)
  if (!first) return '?'
  return second ? `${first[0]}${second[0]}`.toUpperCase() : first.slice(0, 2).toUpperCase()
}

export function Avatar({ name, seed, emoji, imageUrl, size = 'md', className }: AvatarProps) {
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={name}
        className={cn('shrink-0 rounded-full object-cover', SIZE_CLASSES[size], className)}
      />
    )
  }

  const style = emoji ? undefined : { backgroundColor: `oklch(${AVATAR_LIGHTNESS} ${AVATAR_CHROMA} ${hueFromSeed(seed)})` }

  return (
    <span
      role="img"
      aria-label={name}
      style={style}
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full font-medium text-accent-fg',
        SIZE_CLASSES[size],
        className,
      )}
    >
      {emoji ?? initialsFromName(name)}
    </span>
  )
}
