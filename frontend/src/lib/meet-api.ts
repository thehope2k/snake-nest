import { apiRequest } from './api-client'

export interface MeetParticipant {
  userId: string
  joinedAt: string
}

export interface JoinMeetResponse {
  token: string
  livekitUrl: string
  participants: MeetParticipant[]
}

export function joinMeetRequest(token: string, nestId: string): Promise<JoinMeetResponse> {
  return apiRequest<JoinMeetResponse>(`/nests/${nestId}/meet/join`, { method: 'POST', token })
}

export function leaveMeetRequest(token: string, nestId: string): Promise<void> {
  return apiRequest<void>(`/nests/${nestId}/meet/leave`, { method: 'POST', token })
}

export function listMeetParticipantsRequest(token: string, nestId: string): Promise<MeetParticipant[]> {
  return apiRequest<MeetParticipant[]>(`/nests/${nestId}/meet/participants`, { token })
}
