import type { AnalyticsClientsPerAgentDto } from '@vises/contracts'

/** Slice `clientsPerAgent` for client-side ListPager (DEC-P15). */
export const sliceAnalyticsClientsPage = (
  rows: AnalyticsClientsPerAgentDto[],
  page: number,
  pageSize: number,
): AnalyticsClientsPerAgentDto[] => {
  const start = (page - 1) * pageSize
  return rows.slice(start, start + pageSize)
}
