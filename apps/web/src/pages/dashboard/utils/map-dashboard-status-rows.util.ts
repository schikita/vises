import { STATUSES } from '@/entities/application'
import type { OwnerDashboardStatsOut } from '@/features/owner-stats'
import type { DashboardStatusRow } from '../types'

export const mapDashboardStatusRows = (
  stats: OwnerDashboardStatsOut | null,
): DashboardStatusRow[] => {
  if (!stats) return []
  return STATUSES.map((item): DashboardStatusRow => {
    const count =
      stats.appsByStatus.find((row) => row.status === item.id)?.count ?? 0
    return { status: item.id, count }
  })
}
