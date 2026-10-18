import { PORTAL_AUTOFILL_PIPELINE_STAGE_ORDER } from '../constants'
import type { PortalAutofillRunListItem } from '../types'

const CAPTCHA_STAGE_INDEX = (
  PORTAL_AUTOFILL_PIPELINE_STAGE_ORDER as readonly string[]
).indexOf('capmonster_verify')

/**
 * True when captcha CB / Verified UI is useful — not for early navigation failures.
 */
export const isPortalAutofillCaptchaOpsRelevant = (
  run: PortalAutofillRunListItem,
): boolean => {
  if (run.captcha.permanentFailed || run.captcha.budgetExhausted) return true
  if (run.captcha.cbState === 'open' || run.captcha.cbState === 'half-open') {
    return true
  }
  const stage = run.pipelineStage
  if (stage == null || stage === '' || CAPTCHA_STAGE_INDEX < 0) return false
  const idx = (PORTAL_AUTOFILL_PIPELINE_STAGE_ORDER as readonly string[]).indexOf(
    stage,
  )
  return idx >= CAPTCHA_STAGE_INDEX
}
