import type { ReactNode } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useStore } from './store'
import { Shell } from './Shell'
import { Landing } from './pages/Landing'
import { InvitePage } from './pages/Invite'
import { ClientHome } from './pages/ClientHome'
import { NewApplication } from './pages/NewApplication'
import { ClientApplication } from './pages/ClientApplication'
import { Dashboard } from './pages/Dashboard'
import { Applications } from './pages/Applications'
import { ApplicationDetail } from './pages/ApplicationDetail'
import { Payments } from './pages/Payments'
import { SettingsPage } from './pages/Settings'
import { OwnerHome } from './pages/OwnerHome'
import { UsersPage } from './pages/Users'
import { StaffCreateApplication } from './pages/StaffCreateApplication'
import { Visits } from './pages/Visits'
import { homePath, type Role } from './types'

function Guard({ roles, children }: { roles: Role[]; children: ReactNode }) {
  const { session, ready } = useStore()
  if (!ready) return null
  if (!session) return <Navigate to="/" replace />
  if (!roles.includes(session.role)) return <Navigate to={homePath(session.role)} replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/invite/:token" element={<InvitePage />} />
      <Route
        path="/app"
        element={
          <Guard roles={['client']}>
            <Shell kind="client" />
          </Guard>
        }
      >
        <Route index element={<ClientHome />} />
        <Route path="new" element={<NewApplication />} />
        <Route path=":id" element={<ClientApplication />} />
      </Route>
      <Route
        path="/admin"
        element={
          <Guard roles={['manager']}>
            <Shell kind="office" />
          </Guard>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="apps" element={<Applications />} />
        <Route path="apps/new" element={<StaffCreateApplication />} />
        <Route path="apps/:id" element={<ApplicationDetail />} />
        <Route path="visits" element={<Visits />} />
        <Route path="payments" element={<Payments />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route
        path="/owner"
        element={
          <Guard roles={['admin']}>
            <Shell kind="owner" />
          </Guard>
        }
      >
        <Route index element={<OwnerHome />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="apps" element={<Applications />} />
        <Route path="apps/new" element={<StaffCreateApplication />} />
        <Route path="apps/:id" element={<ApplicationDetail />} />
        <Route path="visits" element={<Visits />} />
        <Route path="payments" element={<Payments />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
