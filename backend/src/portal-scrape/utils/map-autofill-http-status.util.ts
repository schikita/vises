import type { AutofillReport, PortalAutofillHttpOutcome } from '../types';

/**
 * Map autofill report outcomes to HTTP statuses (DEC-009).
 * - mapping abort (no browser) → 422
 * - browser / navigation hard failure → 502
 * - fill attempted (incl. field-level ok:false after nav) → 200
 */
export function mapAutofillReportToHttpOutcome(params: {
  report: AutofillReport;
  mappingAborted: boolean;
  browserHardFailure: boolean;
}): PortalAutofillHttpOutcome {
  const { report, mappingAborted, browserHardFailure } = params;

  if (mappingAborted) {
    return { httpStatus: 422, report };
  }

  if (browserHardFailure) {
    return { httpStatus: 502, report };
  }

  return { httpStatus: 200, report };
}
