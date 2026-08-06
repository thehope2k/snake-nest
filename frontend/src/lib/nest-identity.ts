import type { Nest, User } from './types'

const GROUP_ICON = '👥'

export interface NestIdentity {
  name: string
  icon: string
}

export function nestIdentity(nest: Nest, members: User[], selfId: string): NestIdentity {
  if (nest.name) {
    return { name: nest.name, icon: nest.icon ?? GROUP_ICON }
  }
  const others = members.filter((member) => member.id !== selfId)
  if (others.length === 1) {
    return { name: others[0].name, icon: others[0].avatar }
  }
  if (others.length === 0) {
    return { name: 'Just you', icon: GROUP_ICON }
  }
  return { name: others.map((member) => member.name).join(', '), icon: GROUP_ICON }
}
