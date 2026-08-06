import type { Client, IMessage } from '@stomp/stompjs'

export type MeetEvent =
  | { type: 'participant-joined' | 'participant-left'; participantId: string }
  | { type: 'doghouse-started' | 'doghouse-released'; targetUserId: string; until: number }

export function subscribeToNestMeet(client: Client, nestId: string, onEvent: (event: MeetEvent) => void) {
  return client.subscribe(`/topic/nests/${nestId}/meet`, (frame: IMessage) => {
    onEvent(JSON.parse(frame.body) as MeetEvent)
  })
}
