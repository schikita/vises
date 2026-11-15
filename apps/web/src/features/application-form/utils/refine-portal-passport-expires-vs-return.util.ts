import type { RefinementCtx } from 'zod'
import { APPLICANT_DATE_RETURN_VALIDITY_MONTHS } from '../constants/applicant-date.constants'
import { APPLICATION_FORM_MESSAGES } from '../constants/form-messages.constants'
import { addCalendarMonths } from './add-calendar-months.util'
import { compareDateOnlyYmd } from './compare-date-only-ymd.util'
import { formatDateOnlyParts } from './format-date-only-parts.util'
import { parseDateOnly } from './parse-date-only.util'

/**
 * Extended e3 for flat one-page portal form:
 * `passportExpires ≥ returnDate + 3 months` when return is parseable.
 */
export const refinePortalPassportExpiresVsReturn = (
  data: {
    returnDate: string
    passportExpires: string
  },
  ctx: RefinementCtx,
): void => {
  const returnParsed = parseDateOnly(data.returnDate)
  if (returnParsed.status !== 'ok') return

  const expiresParsed = parseDateOnly(data.passportExpires)
  if (expiresParsed.status !== 'ok') return

  const minAfterReturnYmd = formatDateOnlyParts(
    addCalendarMonths(returnParsed.parts, APPLICANT_DATE_RETURN_VALIDITY_MONTHS),
  )

  if (compareDateOnlyYmd(expiresParsed.ymd, minAfterReturnYmd) < 0) {
    ctx.addIssue({
      code: 'custom',
      path: ['passportExpires'],
      message: APPLICATION_FORM_MESSAGES.passportExpiresLtReturnPlus3m,
    })
  }
}
