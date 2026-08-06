import { Navigate, Route, BrowserRouter, Routes } from 'react-router-dom'
import { AuthProvider } from '@/lib/mock-auth'
import { NestStoreProvider } from '@/lib/nest-store'
import { Landing } from '@/routes/Landing'
import { SignIn } from '@/routes/SignIn'
import { RequireAuth } from '@/routes/RequireAuth'
import { NestList } from '@/routes/NestList'
import { NestView } from '@/routes/NestView'

export default function App() {
  return (
    <AuthProvider>
      <NestStoreProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/sign-in" element={<SignIn />} />
            <Route element={<RequireAuth />}>
              <Route path="/nests" element={<NestList />} />
              <Route path="/nests/:nestId/:view?" element={<NestView />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </NestStoreProvider>
    </AuthProvider>
  )
}
