import type { AnalyticsClientsPerAgentDto } from '@vises/contracts'

/**
 * Top agents by client count (tie-break: higher API percentage string, then agentId).
 * Does not recompute percentages — uses API values as-is.
 */
export const pickTopAgentsByClients = (
  rows: AnalyticsClientsPerAgentDto[],
  limit: number,
): AnalyticsClientsPerAgentDto[] => {
  if (limit <= 0 || rows.length === 0) {
    return []
  }
  return [...rows]
    .sort((a, b): number => {
      if (b.count !== a.count) {
        return b.count - a.count
      }
      const pctCmp = b.percentage.localeCompare(a.percentage, undefined, {
        numeric: true,
      })
      if (pctCmp !== 0) {
        return pctCmp
      }
      return a.agentId.localeCompare(b.agentId)
    })
    .slice(0, limit)
}
