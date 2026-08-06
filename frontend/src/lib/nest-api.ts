import { apiRequest } from './api-client'
import type { Nest, User } from './types'

interface MemberDto {
  userId: string
  displayName: string
  avatar: string
}

function toUser(member: MemberDto): User {
  return { id: member.userId, name: member.displayName, avatar: member.avatar }
}

export function createNestRequest(token: string, name: string, icon: string): Promise<Nest> {
  return apiRequest<Nest>('/nests', { method: 'POST', token, body: { name, icon } })
}

export function listNestsRequest(token: string): Promise<Nest[]> {
  return apiRequest<Nest[]>('/nests', { token })
}

export function listMembersRequest(token: string, nestId: string): Promise<User[]> {
  return apiRequest<MemberDto[]>(`/nests/${nestId}/members`, { token }).then((members) => members.map(toUser))
}

export function searchUsersRequest(token: string, nestId: string, query: string): Promise<User[]> {
  const params = new URLSearchParams({ query })
  return apiRequest<MemberDto[]>(`/nests/${nestId}/users?${params}`, { token }).then((members) => members.map(toUser))
}

export function addMemberRequest(token: string, nestId: string, userId: string): Promise<void> {
  return apiRequest<void>(`/nests/${nestId}/members`, { method: 'POST', token, body: { userId } })
}

export function removeMemberRequest(token: string, nestId: string, userId: string): Promise<void> {
  return apiRequest<void>(`/nests/${nestId}/members/${userId}`, { method: 'DELETE', token })
}

export function getInviteCodeRequest(token: string, nestId: string): Promise<string> {
  return apiRequest<{ code: string }>(`/nests/${nestId}/invite`, { token }).then((res) => res.code)
}

export function joinNestRequest(token: string, code: string): Promise<Nest> {
  return apiRequest<Nest>('/nests/join', { method: 'POST', token, body: { code } })
}

export function searchAllUsersRequest(token: string, query: string): Promise<User[]> {
  const params = new URLSearchParams({ query })
  return apiRequest<MemberDto[]>(`/users/search?${params}`, { token }).then((members) => members.map(toUser))
}

export function startConversationRequest(token: string, participantUserIds: string[]): Promise<Nest> {
  return apiRequest<Nest>('/nests/start', { method: 'POST', token, body: { participantUserIds } })
}

export function renameNestRequest(token: string, nestId: string, name: string, icon: string): Promise<Nest> {
  return apiRequest<Nest>(`/nests/${nestId}`, { method: 'PATCH', token, body: { name, icon } })
}
