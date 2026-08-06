import {createContext, type ReactNode, useContext, useEffect, useState} from 'react'
import type {User} from './types'

const STORAGE_KEY = 'nest.mock-session'

interface AuthContextValue {
  user: User | null
  signIn: (name: string) => void
  signOut: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function loadStoredUser(): User | null {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  return JSON.parse(raw) as User
}

function avatarForName(name: string): string {
  const codePoint = name.codePointAt(0) ?? 0x1f40d
  return name.trim().charAt(0).toUpperCase() || String.fromCodePoint(codePoint)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => loadStoredUser())

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [user])

  function signIn(name: string) {
    setUser({ id: crypto.randomUUID(), name, avatar: avatarForName(name) })
  }

  function signOut() {
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, signIn, signOut }}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
