import type { AnalyticsDto } from '@vises/contracts'
import { STATUSES } from '@/entities/application'
import type { AnalyticsStatusRow } from '../types'

/** Map AnalyticsDto BUSINESS buckets onto the full status order (FR-6 / FR-15). */
export const mapAnalyticsStatusRows = (
  analytics: AnalyticsDto | null,
): AnalyticsStatusRow[] => {
  if (!analytics) {
    return []
  }
  return STATUSES.map((item): AnalyticsStatusRow => {
    const bucket = analytics.global.byStatus.find(
      (row): boolean => row.status === item.id,
    )
    return {
      status: item.id,
      count: bucket?.count ?? 0,
      percentage: bucket?.percentage ?? '0.00',
    }
  })
}
