import type { IMessage, Client } from '@stomp/stompjs'

export interface ChatEvent {
  type: 'message-created' | 'reaction-updated'
  message: unknown
}

export function subscribeToNestChat(client: Client, nestId: string, onEvent: (event: ChatEvent) => void) {
  return client.subscribe(`/topic/nests/${nestId}/chat`, (frame: IMessage) => {
    onEvent(JSON.parse(frame.body) as ChatEvent)
  })
}
