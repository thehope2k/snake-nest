import { createContext, type ReactNode, useContext, useEffect, useState } from 'react'
import type { User } from './types'
import { ApiError } from './api-client'
import { loginRequest, registerRequest, type AuthResponse } from './auth-api'

const STORAGE_KEY = 'nest.session'

interface Session {
  token: string
  user: User
}

interface AuthContextValue {
  user: User | null
  token: string | null
  signUp: (email: string, password: string, displayName: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function loadSession(): Session | null {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  return JSON.parse(raw) as Session
}

function toSession(response: AuthResponse): Session {
  return {
    token: response.token,
    user: { id: response.userId, name: response.displayName, avatar: response.avatar, email: response.email },
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(() => loadSession())

  useEffect(() => {
    if (session) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [session])

  async function signUp(email: string, password: string, displayName: string) {
    setSession(toSession(await registerRequest(email, password, displayName)))
  }

  async function signIn(email: string, password: string) {
    setSession(toSession(await loginRequest(email, password)))
  }

  function signOut() {
    setSession(null)
  }

  return (
    <AuthContext.Provider
      value={{ user: session?.user ?? null, token: session?.token ?? null, signUp, signIn, signOut }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}

export { ApiError }
