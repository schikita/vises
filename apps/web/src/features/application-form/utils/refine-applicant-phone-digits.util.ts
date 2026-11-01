import type { RefinementCtx } from 'zod'
import { BELARUS_PHONE_LOCAL_DIGIT_COUNT } from '../constants/belarus-phone.constants'
import { APPLICATION_FORM_MESSAGES } from '../constants/form-messages.constants'
import { digitsOnly } from './digits-only.util'

/**
 * Phone format: exactly 9 digits after `\D` strip.
 * Required-empty is owned by schema `min(1)`; this refine only rejects wrong length.
 */
export const refineApplicantPhoneDigits = (
  data: { phone: string },
  ctx: RefinementCtx,
): void => {
  const digits = digitsOnly(data.phone)
  if (digits.length === 0) return
  if (digits.length !== BELARUS_PHONE_LOCAL_DIGIT_COUNT) {
    ctx.addIssue({
      code: 'custom',
      path: ['phone'],
      message: APPLICATION_FORM_MESSAGES.phoneInvalidDigits,
    })
  }
}
