import { apiRequest } from './api-client'

export type DoghouseRejection = 'already-benched' | 'on-cooldown' | 'nest-full'

interface SendToDoghouseResponse {
  rejection: 'ALREADY_BENCHED' | 'ON_COOLDOWN' | 'NEST_FULL' | null
}

export interface DoghouseState {
  userId: string
  benchedUntil: number | null
  cooldownUntil: number | null
  sentCount: number
}

const REJECTION_BY_CODE: Record<string, DoghouseRejection> = {
  ALREADY_BENCHED: 'already-benched',
  ON_COOLDOWN: 'on-cooldown',
  NEST_FULL: 'nest-full',
}

export async function sendToDoghouseRequest(
  token: string,
  nestId: string,
  targetUserId: string,
): Promise<DoghouseRejection | null> {
  const response = await apiRequest<SendToDoghouseResponse>(`/nests/${nestId}/doghouse/${targetUserId}/send`, {
    method: 'POST',
    token,
  })
  return response.rejection ? REJECTION_BY_CODE[response.rejection] : null
}

export function releaseFromDoghouseRequest(token: string, nestId: string, targetUserId: string): Promise<void> {
  return apiRequest<void>(`/nests/${nestId}/doghouse/${targetUserId}/release`, { method: 'POST', token })
}

export function listDoghouseStateRequest(token: string, nestId: string): Promise<DoghouseState[]> {
  return apiRequest<DoghouseState[]>(`/nests/${nestId}/doghouse`, { token })
}
