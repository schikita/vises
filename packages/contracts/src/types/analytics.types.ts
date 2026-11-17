import type { ApplicationStatus } from './application-status.types';
import type { PaginatedList } from './paginated-list.types';

/**
 * Analytics date-range filter dimension.
 * `createdAt` = application creation timestamp.
 */
export type AnalyticsDateFilterDimension = 'createdAt';

/**
 * Query for `GET /stats/roles-applications` (qa-polish DEC-P2 / DEC-P14 / DEC-P15
 * + FR-15 / DEC-ASAU-009).
 * Both date bounds omitted → current totals. Either/both → filter metrics by
 * application `createdAt`.
 * `page`/`pageSize` paginate only `perAgent` (defaults when omitted: page 1,
 * API default page size). QA “limit” ≡ `pageSize` — no separate `limit` param.
 * Optional `q` filters the pre-pagination `perAgent` universe by agent
 * display name / login / id (case-insensitive contains).
 * `global` and `clientsPerAgent` stay unpaginated.
 */
export type AnalyticsQuery = {
  /** Inclusive lower bound (calendar `YYYY-MM-DD` or ISO-8601). Filters by `createdAt`. */
  from?: string;
  /** Inclusive upper bound (calendar `YYYY-MM-DD` or ISO-8601). Filters by `createdAt`. */
  to?: string;
  page?: number;
  pageSize?: number;
  q?: string;
};

/** Alias used by Nest query DTO / FR-15 docs; same shape as `AnalyticsQuery`. */
export type AnalyticsQueryDto = AnalyticsQuery;

/**
 * Per-status count + percentage bucket (§6.7.1 / FR-15).
 * `status` is a BUSINESS `ApplicationStatus` id only.
 * `percentage` is rounded to 2 decimals and encoded as a decimal string.
 */
export type AnalyticsStatusBucketDto = {
  status: ApplicationStatus;
  count: number;
  percentage: string;
};

/**
 * Per-agent application status distribution (§6.7.1 / FR-15).
 * percentage = count / total applications of that agent × 100.
 * Sort key for the paginated `perAgent` list is client count descending
 * (tie-break `agentId`); see `clientsPerAgent` for per-agent client counts
 * (qa-polish DEC-P2).
 */
export type AnalyticsPerAgentDto = {
  agentId: string;
  totalApplications: number;
  byStatus: AnalyticsStatusBucketDto[];
};

/**
 * Global application status distribution (§6.7.1 / FR-15).
 * percentage = count / total applications × 100.
 */
export type AnalyticsGlobalDto = {
  totalApplications: number;
  byStatus: AnalyticsStatusBucketDto[];
};

/**
 * Agent performance row for `clientsPerAgent` (DEC-ASAU-003 / DEC-ASAU-009 / REQ-008).
 * percentage = count / total clients × 100 (decimal string).
 * Metric definitions (REQ-008):
 * - `balance` = `User.balance` for that agent (decimal string).
 * - `registered` = count of `Client` rows with `agentId` = that agent.
 * - `paid` = count of applications linked to that agent’s clients where `paymentPaid === true`.
 * - `paidAmount` = sum of those apps’ `paymentAmount` (decimal string).
 * `count` remains the clients-per-agent count used for distribution percentage.
 */
export type AnalyticsClientsPerAgentDto = {
  agentId: string;
  count: number;
  percentage: string;
  /** `User.balance` for that agent (decimal string per NFR-001 / REQ-008). */
  balance: string;
  /** Count of `Client` rows with `agentId` = that agent (REQ-008). */
  registered: number;
  /**
   * Count of applications linked to that agent’s clients where
   * `paymentPaid === true` (REQ-008).
   */
  paid: number;
  /**
   * Sum of `paymentAmount` for those paid applications (decimal string;
   * REQ-008 / NFR-001).
   */
  paidAmount: string;
};

/**
 * Booked visits vs unpaid applications (§5.1 / DEC-ASAU-009).
 * Ops risk / revenue follow-up: apps with visit/booked signals vs
 * `paymentPaid === false` in the selected period.
 */
export type AnalyticsBookedVsUnpaidDto = {
  bookedCount: number;
  unpaidCount: number;
};

/**
 * City distribution bucket over the selected period (§5.1 / DEC-ASAU-009).
 * `percentage` = count / total applications in the distribution × 100
 * (decimal string).
 */
export type AnalyticsCityBucketDto = {
  city: string;
  count: number;
  percentage: string;
};

/**
 * Payment / document completeness KPI (§5.1 / DEC-ASAU-009).
 * When only payment flags exist, report payment completeness.
 * `completenessPercentage` is a decimal string (NFR-001).
 */
export type AnalyticsPaymentCompletenessDto = {
  totalApplications: number;
  paidCount: number;
  completenessPercentage: string;
};

/**
 * Agent leaderboard row by paid volume (§5.1 / DEC-ASAU-009).
 * `paidAmount` = sum of `paymentAmount` where `paymentPaid` for apps under
 * the agent’s clients (decimal string). `paidCount` = count of those apps.
 */
export type AnalyticsPaidVolumeAgentDto = {
  agentId: string;
  paidAmount: string;
  paidCount: number;
};

/**
 * Analytics REST response (FR-15 / amends FR-9 / DEC-ASAU-009 / qa-polish DEC-P2).
 * Status buckets use BUSINESS ids only.
 * Optional query `from`/`to` filter by application `createdAt` (see `AnalyticsQuery`).
 * All percentage fields are decimal strings.
 * `perAgent` is sorted by client count descending (tie-break `agentId`) and
 * paginated; use `clientsPerAgent` for the client-count values used to sort.
 * §5.1 admin fields: `bookedVsUnpaid`, `cityDistribution`,
 * `paymentCompleteness`, `paidVolumeByAgent` (status mix via `global.byStatus`).
 */
export type AnalyticsDto = {
  perAgent: PaginatedList<AnalyticsPerAgentDto>;
  global: AnalyticsGlobalDto;
  clientsPerAgent: AnalyticsClientsPerAgentDto[];
  bookedVsUnpaid: AnalyticsBookedVsUnpaidDto;
  cityDistribution: AnalyticsCityBucketDto[];
  paymentCompleteness: AnalyticsPaymentCompletenessDto;
  paidVolumeByAgent: AnalyticsPaidVolumeAgentDto[];
};
