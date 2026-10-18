import type { PortalAutofillCaptureStatus } from '../constants';
import type { PortalAutofillCaptchaSummary } from './portal-autofill-captcha-summary.types';
import type { PortalAutofillRetryEligibility } from './portal-autofill-retry-eligibility.types';
import type { PortalAutofillRunStatus } from '../../portal-core';
import type { PortalFieldProgressSummary } from '../../portal-core';

/**
 * Staff list item for portal autofill runs (DEC-001 / DEC-007).
 * Does not expose `relativePath` / filesystem internals or secrets.
 * Additive enrichment fields for ops status + eligibility (REQ-006 / REQ-007).
 */
export type PortalAutofillRunListItem = {
  id: string;
  applicationId: string;
  applicantId: string;
  /** ISO-8601 timestamp */
  createdAt: string;
  captureStatus: PortalAutofillCaptureStatus;
  reportOk: boolean;
  errorNote: string | null;
  screenshotAvailable: boolean;
  /** Absolute API path when a PNG was captured; otherwise null */
  downloadPath: string | null;
  /**
   * Lifecycle status. Null on legacy evidence-only rows (treat as terminal).
   * Includes `in_progress` when listing live runs.
   */
  status: PortalAutofillRunStatus | null;
  pipelineStage: string | null;
  fieldProgressSummary: PortalFieldProgressSummary | null;
  terminalReason: string | null;
  captcha: PortalAutofillCaptchaSummary;
};

export type PortalAutofillRunListResponse = {
  runs: PortalAutofillRunListItem[];
  /**
   * Pair-scoped retry affordances for `eligibilityApplicantId`
   * (query `applicantId`, else newest in_progress / newest run / first applicant).
   */
  retryEligibility: PortalAutofillRetryEligibility;
  /** Applicant id used for `retryEligibility`; null when none resolvable. */
  eligibilityApplicantId: string | null;
};
