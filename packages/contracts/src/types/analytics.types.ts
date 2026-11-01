import type { ApplicationStatus } from './application-status.types';

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
 * Analytics REST response (FR-9 / §6.7.1 / AC-15 / AC-15a).
 * All percentage fields are decimal strings.
 */
export type AnalyticsDto = {
  perAgent: AnalyticsPerAgentDto[];
  global: AnalyticsGlobalDto;
  clientsPerAgent: AnalyticsClientsPerAgentDto[];
};
