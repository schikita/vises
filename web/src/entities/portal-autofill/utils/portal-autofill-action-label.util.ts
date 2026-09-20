import { PORTAL_AUTOFILL_ACTION_LABEL_RU } from '../constants'
import type { PortalAutofillRetryEligibility } from '../types'

/**
 * Honest staff action label from server eligibility (DEC-008 / REQ-010 / REQ-011).
 * Captcha retry always means a new/supersede run — never “resume”.
 */
export const portalAutofillActionLabel = (
  eligibility: PortalAutofillRetryEligibility,
): string => {
  if (eligibility.captchaRetryViaNewRun) {
    return PORTAL_AUTOFILL_ACTION_LABEL_RU.captcha_new_run
  }
  if (eligibility.impliedMode === 'resume') {
    return PORTAL_AUTOFILL_ACTION_LABEL_RU.resume
  }
  if (eligibility.impliedMode === 'supersede') {
    return PORTAL_AUTOFILL_ACTION_LABEL_RU.supersede
  }
  if (eligibility.impliedMode === 'start_new') {
    return PORTAL_AUTOFILL_ACTION_LABEL_RU.start_new
  }
  return PORTAL_AUTOFILL_ACTION_LABEL_RU.start_new
}
