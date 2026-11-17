import type { AnalyticsStatusBucketDto } from '@vises/contracts'
import { STATUSES } from '@/entities/application'

/**
 * Map API BUSINESS status buckets onto the full §4.A status order.
 * Missing statuses appear as count 0 / percentage 0.00.
 */
export const mapAnalyticsStatusBuckets = (
  buckets: AnalyticsStatusBucketDto[],
): AnalyticsStatusBucketDto[] =>
  STATUSES.map(
    (item): AnalyticsStatusBucketDto => {
      const bucket = buckets.find(
        (row): boolean => row.status === item.id,
      )
      return {
        status: item.id,
        count: bucket?.count ?? 0,
        percentage: bucket?.percentage ?? '0.00',
      }
    },
  )
