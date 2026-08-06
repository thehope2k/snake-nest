import { createContext, useContext } from 'react'
import type { Client } from '@stomp/stompjs'

export interface NestSocketValue {
  client: Client | null
  connected: boolean
}

export const NestSocketContext = createContext<NestSocketValue>({ client: null, connected: false })

// A STOMP Client only has one onConnect/onDisconnect slot, so every consumer racing to
// overwrite it directly would clobber each other. Reading `connected` as reactive state
// instead lets multiple features (chat, Meet presence) subscribe independently.
export function useNestSocket(): NestSocketValue {
  return useContext(NestSocketContext)
}
