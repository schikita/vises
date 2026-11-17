import type { Status } from '@/entities/application'
import type {
  DashboardCityCount,
  DashboardUpcomingVisit,
} from '@/features/owner-stats'

export type DashboardStatusRow = {
  status: Status
  count: number
}

export type DashboardRenderProps = {
  loading: boolean
  error: string
  upcoming: DashboardUpcomingVisit[]
  statusRows: DashboardStatusRow[]
  cities: DashboardCityCount[]
  appsBase: string
}
