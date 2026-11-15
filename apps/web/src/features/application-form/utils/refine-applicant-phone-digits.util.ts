import type { RefinementCtx } from 'zod'
import { portalAutofillPhoneDigits } from '@/entities/portal-autofill'
import { BLS_APPLICANT_COMPLETENESS_PHONE_DIGITS_LENGTH } from '../constants/bls-applicant-completeness.constants'
import { APPLICATION_FORM_MESSAGES } from '../constants/form-messages.constants'

/**
 * Start Completeness phone format: exactly 9 digits after `\D` strip
 * (mirrors `BLS_APPLICANT_COMPLETENESS_PHONE_DIGITS_LENGTH` / AC-07).
 * Required-empty is owned by schema `min(1)`; this refine only rejects wrong length.
 */
export const refineApplicantPhoneDigits = (
  data: { phone: string },
  ctx: RefinementCtx,
): void => {
  const digits = portalAutofillPhoneDigits(data.phone)
  if (digits.length === 0) return
  if (digits.length !== BLS_APPLICANT_COMPLETENESS_PHONE_DIGITS_LENGTH) {
    ctx.addIssue({
      code: 'custom',
      path: ['phone'],
      message: APPLICATION_FORM_MESSAGES.phoneInvalidDigits,
    })
  }
}
