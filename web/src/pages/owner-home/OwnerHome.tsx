import { useEffect, useState } from 'react'
import { money, type Status } from '@/entities/application'
import { OwnerStatsCharts } from '@/features/owner-stats'
import type { OwnerDashboardStatsOut } from '@/features/owner-stats'
import { apiRequest } from '@/shared/api'
import type { User } from '@/entities/user'
import { OwnerHomeRender } from './OwnerHomeRender'

const statusCount = (stats: OwnerDashboardStatsOut | null, id: Status): number =>
  stats?.appsByStatus.find((row) => row.status === id)?.count ?? 0

export const OwnerHome = () => {
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

  const recent: User[] = (stats?.recentUsers ?? []).map((u) => ({
    id: u.id,
    name: u.name,
    login: u.login,
    email: u.email,
    role: (u.role === 'admin' || u.role === 'manager' || u.role === 'client'
      ? u.role
      : 'client') as User['role'],
    active: u.active,
    inviteToken: '',
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
  }))

  const kpis = [
    ['Пользователи', String(stats?.usersTotal ?? 0)],
    ['Клиенты', String(stats?.clientsTotal ?? 0)],
    ['Агенты', String(stats?.managersTotal ?? 0)],
    ['Заявки', String(stats?.appsTotal ?? 0)],
    ['Не оплачено', money(stats?.unpaidTotal ?? 0)],
  ]

  return (
    <OwnerHomeRender
      kpis={kpis}
      recent={recent}
      paid={money(stats?.paidTotal ?? 0)}
      reviewCount={statusCount(stats, 'review')}
      fixesCount={statusCount(stats, 'fixes')}
      inactiveCount={stats?.inactiveUsersTotal ?? 0}
      charts={<OwnerStatsCharts />}
    />
  )
}
