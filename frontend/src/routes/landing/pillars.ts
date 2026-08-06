import { MessageCircle, Video } from 'lucide-react'
import type { ComponentType } from 'react'

export interface Pillar {
  name: string
  blurb: string
  icon?: ComponentType<{ size?: number; className?: string }>
  emoji?: string
}

// Doghouse gets an emoji, not a lucide icon — it's an identity/personality
// moment per ux-philosophy.md, same rule as a Nest icon or a user avatar.
export const PILLARS: Pillar[] = [
  {
    name: 'Chat',
    blurb: 'One persistent conversation per Nest. No channels to manage.',
    icon: MessageCircle,
  },
  {
    name: 'Meet',
    blurb: 'Drop in, no scheduling. Keeps running while you look around.',
    icon: Video,
  },
  {
    name: 'Doghouse',
    blurb: 'Mute a friend out loud, on purpose, for everyone to see.',
    emoji: '🐶',
  },
]
