import type { ApplicationStatus } from './application-status.types';

/**
 * Application response DTO (FR-5 / FR-11 / §4.A).
 * Does not embed passport plaintext; references `clientId` only.
 * `status` is a BUSINESS `ApplicationStatus` id only.
 * `visaSubType` is optional so existing mappers stay compatible until APF-TASK-003 wires read.
 */
export type ApplicationDto = {
  id: string;
  clientId: string;
  status: ApplicationStatus;
  /**
   * Portal Visa Sub Type label/text (REQ-003 / DEC-003).
   * Null when unset; omit until API maps `applications.visa_sub_type`.
   */
  visaSubType?: string | null;
  /** ISO-8601 timestamp */
  createdAt: string;
  /** ISO-8601 timestamp */
  updatedAt: string;
};

/**
 * Staff/monitor/system status change body (FR-11 / FR-13 / §4.C).
 * `targetStatus` must be a legal matrix target for the caller's actor.
 */
export type ApplicationStatusChangeDto = {
  targetStatus: ApplicationStatus;
  trigger?: string;
};
