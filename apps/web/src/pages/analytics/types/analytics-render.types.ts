import type { ReactNode } from 'react'
import type {
  AnalyticsBookedVsUnpaidDto,
  AnalyticsCityBucketDto,
  AnalyticsClientsPerAgentDto,
  AnalyticsPerAgentDto,
  AnalyticsPaymentCompletenessDto,
} from '@vises/contracts'
import type { AnalyticsStatusRow } from './analytics-status-row.types'

export type AnalyticsRenderProps = {
  loading: boolean
  loadError: string
  empty: boolean
  appsTotal: number | null
  agentsTotal: number | null
  statusRows: AnalyticsStatusRow[]
  clientsRows: AnalyticsClientsPerAgentDto[]
  bookedVsUnpaid: AnalyticsBookedVsUnpaidDto | null
  cityDistribution: AnalyticsCityBucketDto[]
  paymentCompleteness: AnalyticsPaymentCompletenessDto | null
  perAgentRows: AnalyticsPerAgentDto[]
  filters: ReactNode
  onAgentActivate: (agentId: string) => void
  profileError: string
}
