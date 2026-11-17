import type { AnalyticsClientsPerAgentDto } from '@vises/contracts'

export type AnalyticsClientsPerAgentRowProps = {
  row: AnalyticsClientsPerAgentDto
  onActivate: (agentId: string) => void
}
