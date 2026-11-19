import type { AnalyticsDto } from '@vises/contracts'

export type AnalyticsReportProps = {
  data: AnalyticsDto
  perAgentPage: number
  agentSearch: string
  onPerAgentPageChange: (page: number) => void
}
