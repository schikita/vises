import { PORTAL_AUTOFILL_RUN_STATUS_LABEL_RU } from '../constants'
import type { PortalAutofillRunStatus } from '../types'

/** Russian label for portal run lifecycle status (not CRM). */
export const portalRunStatusLabel = (
  status: PortalAutofillRunStatus | null,
): string => {
  if (status == null) return 'Завершён (архив)'
  return PORTAL_AUTOFILL_RUN_STATUS_LABEL_RU[status] ?? status
}
