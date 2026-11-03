import type { AnalyticsDto } from '@vises/contracts'

export type AnalyticsReportProps = {
  data: AnalyticsDto
  perAgentPage: number
  perAgentPageSize: number
  perAgentTotal: number
  onPerAgentPageChange: (page: number) => void
}
