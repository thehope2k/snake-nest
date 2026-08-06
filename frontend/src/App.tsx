import { Navigate, Route, BrowserRouter, Routes } from 'react-router-dom'
import { AuthProvider } from '@/lib/auth'
import { NestStoreProvider } from '@/lib/nest-store'
import { Landing } from '@/routes/Landing'
import { RequireAuth } from '@/routes/RequireAuth'
import { AppShell } from '@/routes/AppShell'
import { NestList } from '@/routes/NestList'
import { NestView } from '@/routes/NestView'

export default function App() {
  return (
    <AuthProvider>
      <NestStoreProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/sign-in" element={<Navigate to="/" replace />} />
            <Route element={<RequireAuth />}>
              <Route element={<AppShell />}>
                <Route path="/nests" element={<NestList />} />
                <Route path="/nests/:nestId/:view?" element={<NestView />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </NestStoreProvider>
    </AuthProvider>
  )
}
