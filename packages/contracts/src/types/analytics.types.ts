import type { ApplicationStatus } from './application-status.types';
import type { PaginatedList } from './paginated-list.types';

/**
 * Per-status count + percentage bucket (§6.7.1 / AC-15a).
 * `percentage` is rounded to 2 decimals and encoded as a decimal string.
 */
export type AnalyticsStatusBucketDto = {
  status: ApplicationStatus;
  count: number;
  percentage: string;
};

/**
 * Per-agent application status distribution (§6.7.1 / AC-15 / AC-15a).
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
 * Global application status distribution (§6.7.1 / AC-15 / AC-15a).
 * percentage = count / total applications × 100.
 */
export type AnalyticsGlobalDto = {
  totalApplications: number;
  byStatus: AnalyticsStatusBucketDto[];
};

/**
 * Clients-per-agent distribution (§6.7.1 / AC-15 / AC-15a).
 * percentage = count / total clients × 100.
 */
export type AnalyticsClientsPerAgentDto = {
  agentId: string;
  count: number;
  percentage: string;
};

/**
 * Query for `GET /stats/roles-applications` (qa-polish DEC-P2 / DEC-P14 / DEC-P15).
 * `from`/`to` filter status metrics by receivedAt.
 * `page`/`pageSize` paginate only `perAgent` (defaults when omitted: page 1,
 * API default page size). QA “limit” ≡ `pageSize` — no separate `limit` param.
 * Optional `q` filters the pre-pagination `perAgent` universe by agent
 * display name / login / id (case-insensitive contains).
 * `global` and `clientsPerAgent` stay unpaginated.
 */
export type AnalyticsQuery = {
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
  q?: string;
};

/**
 * Analytics REST response (FR-9 / §6.7.1 / AC-15 / AC-15a / qa-polish DEC-P2).
 * All percentage fields are decimal strings.
 * `perAgent` is sorted by client count descending (tie-break `agentId`) and
 * paginated; use `clientsPerAgent` for the client-count values used to sort.
 */
export type AnalyticsDto = {
  perAgent: PaginatedList<AnalyticsPerAgentDto>;
  global: AnalyticsGlobalDto;
  clientsPerAgent: AnalyticsClientsPerAgentDto[];
};
