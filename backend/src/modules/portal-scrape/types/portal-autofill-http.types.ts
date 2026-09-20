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
};

/**
 * Sync HTTP outcome for portal autofill (DEC-007 / DEC-009).
 * Not-found / bad config throw HttpException before this shape is returned.
 */
export type PortalAutofillHttpOutcome = {
  httpStatus: 200 | 422 | 502;
  report: AutofillReport;
};
