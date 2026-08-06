import type { Client, IMessage } from '@stomp/stompjs'

export interface MeetEvent {
  type: 'participant-joined' | 'participant-left'
  participantId: string
}

export function subscribeToNestMeet(client: Client, nestId: string, onEvent: (event: MeetEvent) => void) {
  return client.subscribe(`/topic/nests/${nestId}/meet`, (frame: IMessage) => {
    onEvent(JSON.parse(frame.body) as MeetEvent)
  })
}
