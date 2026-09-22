import {
  formatPortalAutofillFailureReason,
  portalCaptureStatusLabel,
  portalReportOkLabel,
} from '@/entities/portal-autofill'
import type { PortalAutofillRunFeedbackInput } from '../types'

export const formatRunFeedback = (
  result: PortalAutofillRunFeedbackInput,
): string => {
  const parts: string[] = []

  if (result.httpStatus === 502) {
    parts.push(portalReportOkLabel(false, 'failed'))
    const evidenceError = result.report?.evidence?.error
    if (evidenceError) {
      parts.push(formatPortalAutofillFailureReason(evidenceError))
    } else if (result.message) {
      parts.push(result.message)
    }
    return parts.join(' · ')
  }

  if (result.httpStatus === 422) {
    parts.push(result.message ?? 'Автозаполнение отклонено')
    return parts.join(' · ')
  }

  if (result.report) {
    parts.push(portalReportOkLabel(result.report.ok, 'succeeded'))
    if (result.report.evidence) {
      parts.push(
        result.report.evidence.captureOk
          ? portalCaptureStatusLabel('captured')
          : portalCaptureStatusLabel('capture_failed'),
      )
      if (result.report.evidence.error) {
        parts.push(
          formatPortalAutofillFailureReason(result.report.evidence.error),
        )
      }
    }
  } else if (result.message) {
    parts.push(result.message)
  } else if (result.httpStatus === 0) {
    parts.push('Не удалось выполнить запрос автозаполнения (сеть или таймаут)')
  } else {
    parts.push(`Ответ сервера: ${result.httpStatus}`)
  }
  return parts.join(' · ')
}
