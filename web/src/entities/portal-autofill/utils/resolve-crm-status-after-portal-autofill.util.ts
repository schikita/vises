import type { PortalAutofillCrmOutcome, PortalAutofillRunResult } from '../types'

/**
 * Map autofill result → CRM status, or null when CRM must stay unchanged.
 * Pre-report failures never change CRM.
 * With a report: `review` only when fill ok + screenshot captured;
 * autofill failure MUST NOT set `declined` (REQ-012 / DEC-003 / A-CRM-1).
 */
export const resolveCrmStatusAfterPortalAutofill = (
  result: PortalAutofillRunResult,
): PortalAutofillCrmOutcome | null => {
  if (!result.report) {
    return null
  }

  const fillOk = result.report.ok === true
  const screenshotOk = result.report.evidence?.captureOk === true
  if (fillOk && screenshotOk) {
    return {
      status: 'review',
      note: 'После автозаполнения: поля заполнены, скриншот сохранён — статус «На рассмотрении»',
    }
  }

  // Leave CRM unchanged on autofill failure — do not imply portal rejection.
  return null
}
