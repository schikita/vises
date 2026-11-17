import type { AnalyticsDto } from '@vises/contracts'

/** Unique agent ids across perAgent + clientsPerAgent (FR-5 agent count). */
export const countAnalyticsAgents = (data: AnalyticsDto): number => {
  const ids = new Set<string>()
  for (const row of data.perAgent) {
    ids.add(row.agentId)
  }
  for (const row of data.clientsPerAgent) {
    ids.add(row.agentId)
  }
  return ids.size
}
