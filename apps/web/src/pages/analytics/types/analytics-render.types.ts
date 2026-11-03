import type { ReactNode } from 'react'
import type { AnalyticsDto } from '@vises/contracts'

export type AnalyticsRenderProps = {
  loading: boolean
  loadError: string
  data: AnalyticsDto | null
  filters: ReactNode
  report: ReactNode
  agentSearch: string
  onAgentSearchChange: (value: string) => void
}
