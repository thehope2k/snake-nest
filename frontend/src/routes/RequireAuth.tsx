import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/lib/auth'

export function RequireAuth() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/sign-in" replace />
  return <Outlet />
}
