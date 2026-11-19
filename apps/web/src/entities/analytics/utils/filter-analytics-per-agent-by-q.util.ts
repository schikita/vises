import type { AnalyticsPerAgentDto } from '@vises/contracts'

/** Filter `perAgent` rows by agentId substring (client-side; SoT has no `q` query). */
export const filterAnalyticsPerAgentByQ = (
  rows: AnalyticsPerAgentDto[],
  q: string,
): AnalyticsPerAgentDto[] => {
  const needle = q.trim().toLowerCase()
  if (needle === '') {
    return rows
  }
  return rows.filter((row): boolean =>
    row.agentId.toLowerCase().includes(needle),
  )
}
