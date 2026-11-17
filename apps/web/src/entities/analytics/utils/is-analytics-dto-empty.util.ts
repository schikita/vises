import type { AnalyticsDto } from '@vises/contracts'

/** True when there are no applications and no client rows to show. */
export const isAnalyticsDtoEmpty = (data: AnalyticsDto): boolean =>
  data.global.totalApplications === 0 && data.clientsPerAgent.length === 0
