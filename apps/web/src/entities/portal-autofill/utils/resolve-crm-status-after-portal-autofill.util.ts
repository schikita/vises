import type { PortalAutofillCrmOutcome, PortalAutofillRunResult } from '../types'

/**
 * Map autofill result → BUSINESS status, or null when status must stay unchanged.
 * Pre-report failures never change BUSINESS status.
 * With a report: `not_ready_for_appointment` when fill ok + screenshot captured
 * (legacy CRM `review` → §4.D);
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
      status: 'not_ready_for_appointment',
      note: 'После автозаполнения: поля заполнены, скриншот сохранён — статус «Не готова к записи»',
    }
  }

  // Leave BUSINESS unchanged on autofill failure — do not imply portal rejection.
  return null
}
