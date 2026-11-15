import { Navigate, Route, Routes } from 'react-router-dom'
import { RoleGuard } from '@/app/guards'
import { Shell } from '@/widgets/shell'
import { Landing } from '@/pages/landing'
import { RegisterPage } from '@/pages/register'
import { AnalyticsPage } from '@/pages/analytics'
import {
  ClientDetailPage,
  ClientPortalFormPage,
  ClientsPage,
} from '@/pages/clients'
import { AgentBalancePage, AgentsPage } from '@/pages/agents'
import { BalancePage } from '@/pages/balance'
import { Applications } from '@/pages/applications'
import { ApplicationDetail } from '@/pages/application-detail'
import { SettingsPage } from '@/pages/settings'
import { UsersPage } from '@/pages/users'

/**
 * FE5/FE12 route map (AC-1 / AC-14 / AC-15): `/admin/*` staff, `/app/*` agent.
 * No `/client/*`, `/owner`, invite, payments, visits, or apps/new trees.
 */
export const App = (): React.ReactElement => (
  <Routes>
    <Route path="/" element={<Landing />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route
      path="/app"
      element={
        <RoleGuard roles={['agent']}>
          <Shell kind="agent" />
        </RoleGuard>
      }
    >
      <Route index element={<AnalyticsPage />} />
      <Route path="clients" element={<ClientsPage />} />
      <Route path="clients/:clientId" element={<ClientDetailPage />} />
      <Route
        path="clients/:clientId/portal-form"
        element={<ClientPortalFormPage />}
      />
      <Route path="apps" element={<Applications />} />
      <Route path="apps/:id" element={<ApplicationDetail />} />
      <Route path="balance" element={<BalancePage />} />
    </Route>
    <Route
      path="/admin"
      element={
        <RoleGuard roles={['superadmin', 'admin']}>
          <Shell kind="admin" />
        </RoleGuard>
      }
    >
      <Route index element={<AnalyticsPage />} />
      <Route path="users" element={<UsersPage />} />
      <Route path="agents" element={<AgentsPage />} />
      <Route path="agents/:agentId" element={<AgentBalancePage />} />
      <Route path="clients" element={<ClientsPage />} />
      <Route path="clients/:clientId" element={<ClientDetailPage />} />
      <Route
        path="clients/:clientId/portal-form"
        element={<ClientPortalFormPage />}
      />
      <Route path="apps" element={<Applications />} />
      <Route path="apps/:id" element={<ApplicationDetail />} />
      <Route path="settings" element={<SettingsPage />} />
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
)
