import type { RefinementCtx } from 'zod'
import { APPLICANT_DATE_RETURN_VALIDITY_MONTHS } from '../constants/applicant-date.constants'
import { APPLICATION_FORM_MESSAGES } from '../constants/form-messages.constants'
import { addCalendarMonths } from './add-calendar-months.util'
import { compareDateOnlyYmd } from './compare-date-only-ymd.util'
import { formatDateOnlyParts } from './format-date-only-parts.util'
import { parseDateOnly } from './parse-date-only.util'

/**
 * Extended e3: when `returnDate` is parseable, each applicant
 * `passportExpires ≥ returnDate + 3 months` (DEC-002 / DEC-007).
 * Skipped when return is absent/unparseable.
 */
export const refineApplicationPassportExpiresVsReturn = (
  data: {
    returnDate: string
    applicants: ReadonlyArray<{ passportExpires: string }>
  },
  ctx: RefinementCtx,
): void => {
  const returnParsed = parseDateOnly(data.returnDate)
  if (returnParsed.status !== 'ok') {
    return
  }

  const minAfterReturnYmd = formatDateOnlyParts(
    addCalendarMonths(returnParsed.parts, APPLICANT_DATE_RETURN_VALIDITY_MONTHS),
  )

  data.applicants.forEach((applicant, index) => {
    const expiresParsed = parseDateOnly(applicant.passportExpires)
    if (expiresParsed.status !== 'ok') {
      return
    }
    if (compareDateOnlyYmd(expiresParsed.ymd, minAfterReturnYmd) < 0) {
      ctx.addIssue({
        code: 'custom',
        path: ['applicants', index, 'passportExpires'],
        message: APPLICATION_FORM_MESSAGES.passportExpiresLtReturnPlus3m,
      })
    }
  })
}
