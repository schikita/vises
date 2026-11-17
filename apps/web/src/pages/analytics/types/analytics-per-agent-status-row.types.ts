import type { AnalyticsPerAgentDto } from '@vises/contracts'

export type AnalyticsPerAgentStatusRowProps = {
  row: AnalyticsPerAgentDto
  onActivate: (agentId: string) => void
}
