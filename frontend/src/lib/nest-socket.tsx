import { Client } from '@stomp/stompjs'
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { apiOrigin } from './api-client'
import { useAuth } from './auth'

// Chat and Meet both subscribe to /topic/nests/{nestId}/... on the same authenticated
// STOMP connection — one client shared via context, not one per feature.
function wsUrl(token: string): string {
  const origin = apiOrigin().replace(/^http/, 'ws')
  return `${origin}/ws/websocket?token=${encodeURIComponent(token)}`
}

function createNestSocket(token: string): Client {
  return new Client({
    brokerURL: wsUrl(token),
    reconnectDelay: 3_000,
  })
}

const NestSocketContext = createContext<{ client: Client | null; connected: boolean }>({ client: null, connected: false })

export function NestSocketProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth()
  const [client, setClient] = useState<Client | null>(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    if (!token) {
      setClient(null)
      setConnected(false)
      return
    }
    const nextClient = createNestSocket(token)
    nextClient.onConnect = () => setConnected(true)
    nextClient.onDisconnect = () => setConnected(false)
    nextClient.onWebSocketClose = () => setConnected(false)
    nextClient.activate()
    setClient(nextClient)
    return () => {
      nextClient.deactivate()
      setClient(null)
      setConnected(false)
    }
  }, [token])

  return <NestSocketContext.Provider value={{ client, connected }}>{children}</NestSocketContext.Provider>
}

// A STOMP Client only has one onConnect/onDisconnect slot, so every consumer racing to
// overwrite it directly would clobber each other. Reading `connected` as reactive state
// instead lets multiple features (chat, Meet presence) subscribe independently.
export function useNestSocket(): { client: Client | null; connected: boolean } {
  return useContext(NestSocketContext)
}
