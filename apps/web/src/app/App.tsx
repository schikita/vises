import type { ReactElement } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { RoleGuard } from '@/app/guards'
import { Shell } from '@/widgets/shell'
import { Landing } from '@/pages/landing'
import { RegisterPage } from '@/pages/register'
import { InvitePage } from '@/pages/invite'
import { Dashboard } from '@/pages/dashboard'
import { Applications } from '@/pages/applications'
import { ApplicationDetail } from '@/pages/application-detail'
import { Payments } from '@/pages/payments'
import { SettingsPage } from '@/pages/settings'
import { OwnerHome } from '@/pages/owner-home'
import { AnalyticsPage } from '@/pages/analytics'
import { UsersPage } from '@/pages/users'
import { StaffCreateApplication } from '@/pages/staff-create-application'
import { Visits } from '@/pages/visits'

export const App = (): ReactElement => (
  <Routes>
    <Route path="/" element={<Landing />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route path="/invite/:token" element={<InvitePage />} />
    <Route
      path="/app"
      element={
        <RoleGuard roles={['agent']}>
          <Shell kind="office" />
        </RoleGuard>
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
      path="/admin"
      element={
        <RoleGuard roles={['superadmin', 'admin']}>
          <Shell kind="owner" />
        </RoleGuard>
      }
    >
      <Route index element={<OwnerHome />} />
      <Route path="analytics" element={<AnalyticsPage />} />
      <Route path="users" element={<UsersPage />} />
      <Route path="apps" element={<Applications />} />
      <Route path="apps/new" element={<StaffCreateApplication />} />
      <Route path="apps/:id" element={<ApplicationDetail />} />
      <Route path="visits" element={<Visits />} />
      <Route path="payments" element={<Payments />} />
      <Route path="settings" element={<SettingsPage />} />
    </Route>
    <Route path="/owner/*" element={<Navigate to="/admin" replace />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
)
