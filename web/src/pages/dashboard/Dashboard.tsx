import { useEffect, useState } from 'react'
import { money, type Status } from '@/entities/application'
import type { OwnerDashboardStatsOut } from '@/features/owner-stats'
import { staffBase } from '@/entities/session'
import { useStore } from '@/app/providers'
import { apiRequest } from '@/shared/api'
import { DashboardRender } from './DashboardRender'

const statusCount = (stats: OwnerDashboardStatsOut | null, id: Status): number =>
  stats?.appsByStatus.find((row) => row.status === id)?.count ?? 0

export const Dashboard = () => {
  const { session } = useStore()
  const [stats, setStats] = useState<OwnerDashboardStatsOut | null>(null)

  useEffect(() => {
    let cancelled = false
    void apiRequest<OwnerDashboardStatsOut>('/stats/dashboard')
      .then((next) => {
        if (!cancelled) setStats(next)
      })
      .catch(() => {
        if (!cancelled) setStats(null)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const visitCount =
    statusCount(stats, 'booked') + statusCount(stats, 'done')

  const kpis = [
    ['Заявки', String(stats?.appsTotal ?? 0)],
    ['Заявители', String(stats?.applicantsTotal ?? 0)],
    ['Визиты', String(visitCount)],
    ['Оплачено', money(stats?.paidTotal ?? 0)],
    ['Не оплачено', money(stats?.unpaidTotal ?? 0)],
  ]

  return (
    <DashboardRender
      appsCount={stats?.appsTotal ?? 0}
      kpis={kpis}
      cities={stats?.cities ?? []}
      upcoming={stats?.upcomingVisits ?? []}
      byStatus={(id) => statusCount(stats, id)}
      appsBase={`${staffBase(session?.role)}/apps`}
    />
  )
}
