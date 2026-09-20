import { PORTAL_AUTOFILL_CB_STATE_LABEL_RU } from '../constants'
import type { PortalAutofillCapMonsterCbState } from '../types'

/** Russian label for CapMonster circuit-breaker state. */
export const portalCaptchaCbStateLabel = (
  cbState: PortalAutofillCapMonsterCbState | null,
): string => {
  if (cbState == null) return '—'
  return PORTAL_AUTOFILL_CB_STATE_LABEL_RU[cbState] ?? cbState
}
