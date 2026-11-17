import type { ApplicationStatus } from '@vises/contracts'

export type AppsByStatusRow = {
  status: ApplicationStatus
  count: number
}

export type CreatedByDayRow = {
  date: string
  count: number
}

export type DashboardCityCount = {
  city: string
  count: number
}

export type DashboardRecentUser = {
  id: string
  name: string
  login: string
  email: string
  role: string
  active: boolean
  createdAt: string
  updatedAt: string
}

export type DashboardUpcomingVisit = {
  id: string
  code: string
  visitDate: string
  visitTime: string
  status: string
  primaryLastName: string
}

/**
 * Payload from GET /stats/dashboard.
 * Do not render money/ledger fields (paidTotal, unpaidTotal, etc.).
 * Система meaningful totals/agents/top-agents come from AnalyticsDto
 * (`GET /stats/roles-applications`); this DTO still supplies operational lists.
 */
export type OwnerDashboardStatsOut = {
  rangeDays: number
  from: string
  to: string
  appsByStatus: AppsByStatusRow[]
  appsCreatedByDay: CreatedByDayRow[]
  usersCreatedByDay: CreatedByDayRow[]
  appsTotal: number
  applicantsTotal: number
  usersTotal: number
  clientsTotal: number
  managersTotal: number
  inactiveUsersTotal: number
  paidTotal: number
  unpaidTotal: number
  cities: DashboardCityCount[]
  recentUsers: DashboardRecentUser[]
  upcomingVisits: DashboardUpcomingVisit[]
}

