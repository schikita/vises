import type { AnalyticsPerAgentDto } from '@vises/contracts'

/** Slice `perAgent` for client-side ListPager (SoT returns full array). */
export const sliceAnalyticsPerAgentPage = (
  rows: AnalyticsPerAgentDto[],
  page: number,
  pageSize: number,
): AnalyticsPerAgentDto[] => {
  const start = (page - 1) * pageSize
  return rows.slice(start, start + pageSize)
}
