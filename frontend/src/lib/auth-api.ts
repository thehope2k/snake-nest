import { apiRequest } from './api-client'

export interface AuthResponse {
  token: string
  userId: string
  email: string
  displayName: string
  avatar: string
}

export function registerRequest(email: string, password: string, displayName: string): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/auth/register', {
    method: 'POST',
    body: { email, password, displayName },
  })
}

export function loginRequest(email: string, password: string): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/auth/login', {
    method: 'POST',
    body: { email, password },
  })
}
