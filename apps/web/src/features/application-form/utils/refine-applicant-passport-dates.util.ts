import type { RefinementCtx } from 'zod'
import {
  APPLICANT_DATE_MAX_ISSUE_AGE_YEARS,
  APPLICANT_DATE_MIN_VALIDITY_DAYS,
} from '../constants/applicant-date.constants'
import { APPLICATION_FORM_MESSAGES } from '../constants/form-messages.constants'
import { addCalendarDays } from './add-calendar-days.util'
import { addCalendarYears } from './add-calendar-years.util'
import { compareDateOnlyYmd } from './compare-date-only-ymd.util'
import { formatDateOnlyParts } from './format-date-only-parts.util'
import { parseDateOnly } from './parse-date-only.util'
import { resolveLocalReferenceDateYmd } from './resolve-local-reference-date-ymd.util'

/**
 * Core a/b/c + Extended e1/e2/e4 for one applicant (local `D`, DEC-004).
 * Field-path issues for RHF (REQ-005 / REQ-006 / REQ-010).
 */
export const refineApplicantPassportDates = (
  data: {
    dob: string
    passportIssued: string
    passportExpires: string
  },
  ctx: RefinementCtx,
): void => {
  const referenceDateYmd = resolveLocalReferenceDateYmd()
  const referenceParsed = parseDateOnly(referenceDateYmd)
  const dobParsed = parseDateOnly(data.dob)
  const issuedParsed = parseDateOnly(data.passportIssued)
  const expiresParsed = parseDateOnly(data.passportExpires)

  if (dobParsed.status === 'missing') {
    ctx.addIssue({
      code: 'custom',
      path: ['dob'],
      message: APPLICATION_FORM_MESSAGES.dobRequired,
    })
  } else if (dobParsed.status === 'unparseable') {
    ctx.addIssue({
      code: 'custom',
      path: ['dob'],
      message: APPLICATION_FORM_MESSAGES.dobUnparseable,
    })
  } else if (
    dobParsed.status === 'ok' &&
    compareDateOnlyYmd(dobParsed.ymd, referenceDateYmd) >= 0
  ) {
    ctx.addIssue({
      code: 'custom',
      path: ['dob'],
      message: APPLICATION_FORM_MESSAGES.dobNotBeforeToday,
    })
  }

  if (issuedParsed.status === 'missing') {
    ctx.addIssue({
      code: 'custom',
      path: ['passportIssued'],
      message: APPLICATION_FORM_MESSAGES.passportIssuedRequired,
    })
  } else if (issuedParsed.status === 'unparseable') {
    ctx.addIssue({
      code: 'custom',
      path: ['passportIssued'],
      message: APPLICATION_FORM_MESSAGES.passportIssuedUnparseable,
    })
  } else if (
    issuedParsed.status === 'ok' &&
    compareDateOnlyYmd(issuedParsed.ymd, referenceDateYmd) > 0
  ) {
    ctx.addIssue({
      code: 'custom',
      path: ['passportIssued'],
      message: APPLICATION_FORM_MESSAGES.passportIssuedFuture,
    })
  }

  if (expiresParsed.status === 'missing') {
    ctx.addIssue({
      code: 'custom',
      path: ['passportExpires'],
      message: APPLICATION_FORM_MESSAGES.passportExpiresRequired,
    })
  } else if (expiresParsed.status === 'unparseable') {
    ctx.addIssue({
      code: 'custom',
      path: ['passportExpires'],
      message: APPLICATION_FORM_MESSAGES.passportExpiresUnparseable,
    })
  } else if (expiresParsed.status === 'ok' && referenceParsed.status === 'ok') {
    const minExpiryYmd = formatDateOnlyParts(
      addCalendarDays(referenceParsed.parts, APPLICANT_DATE_MIN_VALIDITY_DAYS),
    )
    if (compareDateOnlyYmd(expiresParsed.ymd, minExpiryYmd) < 0) {
      ctx.addIssue({
        code: 'custom',
        path: ['passportExpires'],
        message: APPLICATION_FORM_MESSAGES.passportExpiresLt180Days,
      })
    }
  }

  if (issuedParsed.status === 'ok' && expiresParsed.status === 'ok') {
    if (compareDateOnlyYmd(issuedParsed.ymd, expiresParsed.ymd) > 0) {
      ctx.addIssue({
        code: 'custom',
        path: ['passportIssued'],
        message: APPLICATION_FORM_MESSAGES.passportIssuedAfterExpires,
      })
    }
  }

  if (issuedParsed.status === 'ok' && dobParsed.status === 'ok') {
    if (compareDateOnlyYmd(issuedParsed.ymd, dobParsed.ymd) < 0) {
      ctx.addIssue({
        code: 'custom',
        path: ['passportIssued'],
        message: APPLICATION_FORM_MESSAGES.passportIssuedBeforeDob,
      })
    }
  }

  if (issuedParsed.status === 'ok' && referenceParsed.status === 'ok') {
    const minIssuedYmd = formatDateOnlyParts(
      addCalendarYears(referenceParsed.parts, -APPLICANT_DATE_MAX_ISSUE_AGE_YEARS),
    )
    if (compareDateOnlyYmd(issuedParsed.ymd, minIssuedYmd) < 0) {
      ctx.addIssue({
        code: 'custom',
        path: ['passportIssued'],
        message: APPLICATION_FORM_MESSAGES.passportIssuedOlderThan10y,
      })
    }
  }
}
