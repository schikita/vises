import {
  APPLICATION_STATUSES,
  type AnalyticsStatusBucketDto,
  type ApplicationStatus,
} from '@vises/contracts';
import { formatPercentage } from './format-percentage.util';

/**
 * Status distribution buckets (§6.7.1). Always emits every ApplicationStatus.
 */
export const buildStatusBuckets = (
  statusCounts: ReadonlyMap<ApplicationStatus, number>,
  total: number,
): AnalyticsStatusBucketDto[] => {
  return APPLICATION_STATUSES.map((status): AnalyticsStatusBucketDto => {
    const count = statusCounts.get(status) ?? 0;
    return {
      status,
      count,
      percentage: formatPercentage(count, total),
    };
  });
};
