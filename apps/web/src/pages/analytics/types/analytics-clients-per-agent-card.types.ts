import type { AnalyticsClientsPerAgentDto } from '@vises/contracts'

export type AnalyticsClientsPerAgentCardProps = {
  rows: AnalyticsClientsPerAgentDto[]
  onAgentActivate: (agentId: string) => void
}
