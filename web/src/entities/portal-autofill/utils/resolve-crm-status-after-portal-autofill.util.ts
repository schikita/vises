import type { PortalAutofillCrmOutcome, PortalAutofillRunResult } from '../types'

/**
 * Map autofill result → CRM status, or null when there is no fill report
 * (pre-report proxy/config/auth/network failures must not change CRM).
 * With a report: review only when fill ok + screenshot captured; otherwise declined.
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
  return {
    status: 'declined',
    note: 'После автозаполнения: ошибка или скриншот не сохранён — статус «Отклонено»',
  }
}
