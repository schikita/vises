import type { PortalAutofillCaptureStatus } from '../types'

/** Russian labels for portal run capture status (DEC-006). Do not use CRM StatusBadge. */
export const portalCaptureStatusLabel = (status: PortalAutofillCaptureStatus) => {
  if (status === 'captured') return 'Скриншот сохранён'
  if (status === 'capture_failed') return 'Скриншот не сохранён'
  return status
}
