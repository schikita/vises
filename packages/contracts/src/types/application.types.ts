import type { ApplicationStatus } from './application-status.types';

/**
 * Application response DTO (FR-5 / FR-7 / §6.6).
 * Does not embed passport plaintext; references `clientId` only.
 */
export type ApplicationDto = {
  id: string;
  clientId: string;
  status: ApplicationStatus;
  /** ISO-8601 timestamp */
  createdAt: string;
  /** ISO-8601 timestamp */
  updatedAt: string;
};

/**
 * Staff/monitor status change body (FR-7 / §6.6 / AC-12).
 */
export type ApplicationStatusChangeDto = {
  targetStatus: ApplicationStatus;
  trigger?: string;
};
