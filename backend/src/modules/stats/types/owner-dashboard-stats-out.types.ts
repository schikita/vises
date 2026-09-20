import type { DashboardCityCount } from './dashboard-city-count.types';
import type { DashboardRecentUser } from './dashboard-recent-user.types';
import type { DashboardUpcomingVisit } from './dashboard-upcoming-visit.types';

/** Single status bucket for the circle chart (DEC-005). */
export type AppsByStatusRow = {
  status: string;
  count: number;
};

/** Single calendar-day bucket for column charts (DEC-005). */
export type CreatedByDayRow = {
  /** UTC calendar day `YYYY-MM-DD`. */
  date: string;
  count: number;
};

/**
 * On-the-fly staff dashboard payload (DEC-005 / REQ-029 + ISSUE-001).
 * `appsByStatus` is all applications (current pipeline).
 * Day series cover `[from, to]` inclusive UTC days for `rangeDays`.
 * Home KPI fields replace former full `apps`/`users` store caches.
 */
export type OwnerDashboardStatsOut = {
  rangeDays: number;
  /** Inclusive range start — ISO timestamptz at UTC midnight. */
  from: string;
  /** Inclusive range end — ISO timestamptz at UTC end-of-day (23:59:59.999Z). */
  to: string;
  appsByStatus: AppsByStatusRow[];
  appsCreatedByDay: CreatedByDayRow[];
  usersCreatedByDay: CreatedByDayRow[];
  appsTotal: number;
  applicantsTotal: number;
  usersTotal: number;
  clientsTotal: number;
  managersTotal: number;
  inactiveUsersTotal: number;
  paidTotal: number;
  unpaidTotal: number;
  cities: DashboardCityCount[];
  recentUsers: DashboardRecentUser[];
  upcomingVisits: DashboardUpcomingVisit[];
};
