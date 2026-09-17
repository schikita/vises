import type { AutofillReport } from './portal-report.types';

/** HTTP autofill input (DEC-001 / DEC-003 API path). */
export type PortalAutofillHttpInput = {
  applicationId: string;
  applicantId: string;
  /** JWT actor id for audit (DEC-005); not part of POST body. */
  triggeredByUserId?: string;
};

/**
 * Sync HTTP outcome for portal autofill (DEC-007 / DEC-009).
 * Not-found / bad config throw HttpException before this shape is returned.
 */
export type PortalAutofillHttpOutcome = {
  httpStatus: 200 | 422 | 502;
  report: AutofillReport;
};
