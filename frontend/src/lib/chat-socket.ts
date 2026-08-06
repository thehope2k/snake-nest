import { Client, type IMessage } from '@stomp/stompjs'
import { apiOrigin } from './api-client'

export interface ChatEvent {
  type: 'message-created' | 'reaction-updated'
  message: unknown
}

function wsUrl(token: string): string {
  const origin = apiOrigin().replace(/^http/, 'ws')
  return `${origin}/ws/websocket?token=${encodeURIComponent(token)}`
}

export function createChatSocket(token: string): Client {
  return new Client({
    brokerURL: wsUrl(token),
    reconnectDelay: 3_000,
  })
}

export function subscribeToNestChat(client: Client, nestId: string, onEvent: (event: ChatEvent) => void) {
  return client.subscribe(`/topic/nests/${nestId}/chat`, (frame: IMessage) => {
    onEvent(JSON.parse(frame.body) as ChatEvent)
  })
}
