import {
  portalCaptureStatusLabel,
  portalReportOkLabel,
} from '@/entities/portal-autofill'
import type { PortalAutofillRunFeedbackInput } from '../types'

export const formatRunFeedback = (result: PortalAutofillRunFeedbackInput): string => {
  const parts: string[] = []
  if (result.report) {
    parts.push(portalReportOkLabel(result.report.ok))
    if (result.report.evidence) {
      parts.push(
        result.report.evidence.captureOk
          ? portalCaptureStatusLabel('captured')
          : portalCaptureStatusLabel('capture_failed'),
      )
      if (result.report.evidence.error) parts.push(result.report.evidence.error)
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
