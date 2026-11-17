import type { AnalyticsClientsPerAgentDto } from '@vises/contracts'
import type { User } from '@/entities/user'
import type { DashboardCityCount } from '@/features/owner-stats'

export type OwnerHomeRenderProps = {
  loading: boolean
  error: string
  analyticsError: string
  appsTotal: number | null
  agentsTotal: number | null
  recent: User[]
  topAgents: AnalyticsClientsPerAgentDto[]
  cities: DashboardCityCount[]
  appsBase: string
  usersBase: string
}
