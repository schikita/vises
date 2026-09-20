export type AppsByStatusRow = {
  status: string
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

/** Payload from GET /stats/dashboard (DEC-005 + ISSUE-001 home KPIs). */
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

export type OwnerStatsChartsProps = {
  stats: OwnerDashboardStatsOut | null
  loading: boolean
  error: string
}
