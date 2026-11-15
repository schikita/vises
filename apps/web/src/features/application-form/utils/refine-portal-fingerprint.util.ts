import type { RefinementCtx } from 'zod'
import { APPLICATION_FORM_MESSAGES } from '../constants/form-messages.constants'
import type { PortalFingerprintRefineData } from '../types/portal-fingerprint-refine.types'
import { isFingerprintDateRequired } from './is-fingerprint-date-required.util'
import { isNonEmptyTrimmed } from './is-non-empty-trimmed.util'

/**
 * Fingerprint date required only when selected status requires it
 * (typically `0`); empty status allowed (AC-14).
 */
export const refinePortalFingerprint = (
  data: PortalFingerprintRefineData,
  ctx: RefinementCtx,
): void => {
  if (!isFingerprintDateRequired(data.previousFingerPrintStatus)) return
  if (isNonEmptyTrimmed(data.previousFingerPrintDate)) return
  ctx.addIssue({
    code: 'custom',
    path: ['previousFingerPrintDate'],
    message: APPLICATION_FORM_MESSAGES.previousFingerPrintDateRequired,
  })
}
