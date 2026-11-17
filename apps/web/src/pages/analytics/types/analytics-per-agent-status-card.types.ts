import type { AnalyticsPerAgentDto } from '@vises/contracts'

export type AnalyticsPerAgentStatusCardProps = {
  rows: AnalyticsPerAgentDto[]
  onAgentActivate: (agentId: string) => void
}
