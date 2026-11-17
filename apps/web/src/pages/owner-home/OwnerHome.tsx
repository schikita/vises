import { useEffect, useState, type ReactElement } from 'react'
import type { AnalyticsDto } from '@vises/contracts'
import { useStore } from '@/app/providers'
import {
  countAnalyticsAgents,
  fetchRolesApplicationsAnalytics,
  pickTopAgentsByClients,
} from '@/entities/analytics'
import { staffBase } from '@/entities/session'
import { toStaffRole, type User } from '@/entities/user'
import type { OwnerDashboardStatsOut } from '@/features/owner-stats'
import { apiRequest } from '@/shared/api'
import { OWNER_HOME_COPY, OWNER_HOME_TOP_AGENTS_LIMIT } from './constants'
import { OwnerHomeRender } from './OwnerHomeRender'

export const OwnerHome = (): ReactElement => {
  const { session } = useStore()
  const [stats, setStats] = useState<OwnerDashboardStatsOut | null>(null)
  const [analytics, setAnalytics] = useState<AnalyticsDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [analyticsError, setAnalyticsError] = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    setAnalyticsError('')

    void Promise.allSettled([
      apiRequest<OwnerDashboardStatsOut>('/stats/dashboard'),
      fetchRolesApplicationsAnalytics(),
    ]).then(([dashboardResult, analyticsResult]) => {
      if (cancelled) {
        return
      }

      if (dashboardResult.status === 'fulfilled') {
        setStats(dashboardResult.value)
        setError('')
      } else {
        setStats(null)
        setError(OWNER_HOME_COPY.loadError)
      }

      if (analyticsResult.status === 'fulfilled') {
        setAnalytics(analyticsResult.value)
        setAnalyticsError('')
      } else {
        setAnalytics(null)
        setAnalyticsError(OWNER_HOME_COPY.analyticsLoadError)
      }

      setLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [])

  const base = staffBase(session?.role)
  const recent: User[] = (stats?.recentUsers ?? []).map((u) => ({
    id: u.id,
    name: u.name,
    login: u.login,
    email: u.email,
    role: toStaffRole(u.role),
    active: u.active,
    inviteToken: '',
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
  }))

  return (
    <OwnerHomeRender
      loading={loading}
      error={error}
      analyticsError={analyticsError}
      appsTotal={analytics ? analytics.global.totalApplications : null}
      agentsTotal={analytics ? countAnalyticsAgents(analytics) : null}
      recent={recent}
      topAgents={
        analytics
          ? pickTopAgentsByClients(
              analytics.clientsPerAgent,
              OWNER_HOME_TOP_AGENTS_LIMIT,
            )
          : []
      }
      cities={stats?.cities ?? []}
      appsBase={`${base}/apps`}
      usersBase={`${base}/users`}
    />
  )
}
