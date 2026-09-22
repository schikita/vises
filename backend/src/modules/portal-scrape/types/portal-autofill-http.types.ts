import type { AutofillReport } from './portal-report.types';

/** HTTP autofill input (DEC-001 / DEC-003 API path). */
export type PortalAutofillHttpInput = {
  applicationId: string;
  applicantId: string;
  /** JWT actor id for audit (DEC-005); not part of POST body. */
  triggeredByUserId?: string;
  /**
   * When true, abandon eligible/in_progress prior run and start a new runId (DEC-009).
   * Default false → resume eligible in_progress for the same application+applicant.
   */
  supersede?: boolean;
  /**
   * Durable BLS workflow id when REGISTER is driven by the workflow runner
   * (REQ-016 / DEC-007). When set after OTP success, autofill vaults
   * MAILTM_PASSWORD / MAILTM_TOKEN. Legacy sync HTTP omits this — still
   * retains the mailbox (no delete) but does not vault.
   */
  workflowId?: string;
};

/**
 * Sync HTTP outcome for portal autofill (DEC-007 / DEC-009).
 * Not-found / bad config throw HttpException before this shape is returned.
 */
export type PortalAutofillHttpOutcome = {
  httpStatus: 200 | 422 | 502;
  report: AutofillReport;
};
