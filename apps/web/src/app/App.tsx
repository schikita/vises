import { Navigate, Route, Routes } from 'react-router-dom'
import { RoleGuard } from '@/app/guards'
import { Shell } from '@/widgets/shell'
import { Landing } from '@/pages/landing'
import { InvitePage } from '@/pages/invite'
import { ClientHome } from '@/pages/client-home'
import { NewApplication } from '@/pages/new-application'
import { ClientApplication } from '@/pages/client-application'
import { Dashboard } from '@/pages/dashboard'
import { Applications } from '@/pages/applications'
import { ApplicationDetail } from '@/pages/application-detail'
import { HttpFlowPage, HttpFlowIndex } from '@/pages/http-flow'
import { Payments } from '@/pages/payments'
import { SettingsPage } from '@/pages/settings'
import { OwnerHome } from '@/pages/owner-home'
import { UsersPage } from '@/pages/users'
import { StaffCreateApplication } from '@/pages/staff-create-application'
import { Visits } from '@/pages/visits'

export const App = () => (
  <Routes>
    <Route path="/" element={<Landing />} />
    <Route path="/invite/:token" element={<InvitePage />} />
    <Route
      path="/app"
      element={
        <RoleGuard roles={['client']}>
          <Shell kind="client" />
        </RoleGuard>
      }
    >
      <Route index element={<ClientHome />} />
      <Route path="new" element={<NewApplication />} />
      <Route path=":id" element={<ClientApplication />} />
    </Route>
    <Route
      path="/admin"
      element={
        <RoleGuard roles={['manager']}>
          <Shell kind="office" />
        </RoleGuard>
      }
    >
      <Route index element={<Dashboard />} />
      <Route path="apps" element={<Applications />} />
      <Route path="flow-http" element={<HttpFlowIndex />} />
      <Route path="apps/new" element={<StaffCreateApplication />} />
      <Route path="apps/:id" element={<ApplicationDetail />} />
      <Route path="apps/:id/flow-http" element={<HttpFlowPage />} />
      <Route path="visits" element={<Visits />} />
      <Route path="payments" element={<Payments />} />
      <Route path="settings" element={<SettingsPage />} />
    </Route>
    <Route
      path="/owner"
      element={
        <RoleGuard roles={['admin']}>
          <Shell kind="owner" />
        </RoleGuard>
      }
    >
      <Route index element={<OwnerHome />} />
      <Route path="users" element={<UsersPage />} />
      <Route path="apps" element={<Applications />} />
      <Route path="flow-http" element={<HttpFlowIndex />} />
      <Route path="apps/new" element={<StaffCreateApplication />} />
      <Route path="apps/:id" element={<ApplicationDetail />} />
      <Route path="visits" element={<Visits />} />
      <Route path="payments" element={<Payments />} />
      <Route path="settings" element={<SettingsPage />} />
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
)
