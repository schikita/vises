import { useEffect, useState, type ReactElement } from 'react'
import { useStore } from '@/app/providers'
import { staffBase } from '@/entities/session'
import type { OwnerDashboardStatsOut } from '@/features/owner-stats'
import { apiRequest } from '@/shared/api'
import { DASHBOARD_COPY } from './constants'
import { DashboardRender } from './DashboardRender'
import { mapDashboardStatusRows } from './utils'

export const Dashboard = (): ReactElement => {
  const { session } = useStore()
  const [stats, setStats] = useState<OwnerDashboardStatsOut | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    void apiRequest<OwnerDashboardStatsOut>('/stats/dashboard')
      .then((next) => {
        if (cancelled) return
        setStats(next)
        setError('')
      })
      .catch(() => {
        if (cancelled) return
        setStats(null)
        setError(DASHBOARD_COPY.loadError)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <DashboardRender
      loading={loading}
      error={error}
      upcoming={stats?.upcomingVisits ?? []}
      statusRows={mapDashboardStatusRows(stats)}
      cities={stats?.cities ?? []}
      appsBase={`${staffBase(session?.role)}/apps`}
    />
  )
}
