import type { PortalAutofillRunStatus } from '../types'

/**
 * Russian outcome label for portal autofill.
 * `reportOk` only means field-fill quality after a successful run settle —
 * failed/abandoned/502 runs are not “Заполнение: с ошибками”.
 */
export const portalReportOkLabel = (
  reportOk: boolean,
  status?: PortalAutofillRunStatus | null,
): string => {
  if (status === 'failed') return 'Автозаполнение: ошибка'
  if (status === 'abandoned') return 'Автозаполнение: прервано'
  if (status === 'in_progress') return 'Автозаполнение: выполняется'
  return reportOk ? 'Заполнение: успешно' : 'Заполнение: с ошибками'
}
