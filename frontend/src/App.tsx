import { Navigate, Route, BrowserRouter, Routes } from 'react-router-dom'
import { TooltipProvider } from '@/components/ui'
import { AuthProvider } from '@/lib/auth'
import { NestSocketProvider } from '@/lib/nest-socket'
import { NestStoreProvider } from '@/lib/nest-store'
import { MeetCallProvider } from '@/lib/meet-call'
import { FloatingCallWidget } from '@/components/meet/FloatingCallWidget'
import { Landing } from '@/routes/Landing'
import { RequireAuth } from '@/routes/RequireAuth'
import { AppShell } from '@/routes/AppShell'
import { NestList } from '@/routes/NestList'
import { NestView } from '@/routes/NestView'

export default function App() {
  return (
    <TooltipProvider>
      <AuthProvider>
        <NestSocketProvider>
          <NestStoreProvider>
            <MeetCallProvider>
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route path="/sign-in" element={<Navigate to="/" replace />} />
                  <Route element={<RequireAuth />}>
                    <Route element={<AppShell />}>
                      <Route path="/nests" element={<NestList />} />
                      <Route path="/nests/:nestId" element={<NestView />} />
                    </Route>
                  </Route>
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
                <FloatingCallWidget />
              </BrowserRouter>
            </MeetCallProvider>
          </NestStoreProvider>
        </NestSocketProvider>
      </AuthProvider>
    </TooltipProvider>
  )
}
