import { apiRequestRaw, extractApiErrorDetail } from '@/shared/api'
import type { AutofillReportSummary, PortalAutofillRunResult } from '../types'
import { isAutofillReportSummary } from './is-autofill-report-summary.util'

/**
 * Real POST portal autofill; keeps JSON body on 200/422/502 (parity with former store).
 * Does not use apiRequest alone — that drops error bodies.
 */
export const runPortalAutofillRequest = async (
  applicationId: string,
  applicantId: string,
): Promise<PortalAutofillRunResult> => {
  const { status, data, networkError } = await apiRequestRaw<
    AutofillReportSummary | { detail?: string | { msg: string }[] } | null
  >(`/apps/${applicationId}/portal-autofill`, {
    method: 'POST',
    data: { applicantId },
    headers: { 'Content-Type': 'application/json' },
  })

  if (networkError) {
    return {
      httpStatus: 0,
      message: 'Не удалось выполнить запрос автозаполнения (сеть или таймаут)',
    }
  }

  const detailMessage = extractApiErrorDetail(data)

  if (status === 200 || status === 422 || status === 502) {
    if (isAutofillReportSummary(data)) {
      return { httpStatus: status, report: data }
    }
    return {
      httpStatus: status,
      message: detailMessage ?? `Ошибка автозаполнения (${status})`,
    }
  }

  if (status === 401 || status === 403) {
    return {
      httpStatus: status,
      message: detailMessage ?? 'Нет доступа к автозаполнению',
    }
  }

  return {
    httpStatus: status,
    message: detailMessage ?? `Ошибка автозаполнения (${status})`,
  }
}
