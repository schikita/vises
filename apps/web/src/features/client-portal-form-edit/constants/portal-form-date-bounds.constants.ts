import { addYears, endOfYear, startOfYear, subYears } from 'date-fns'

/** Years before today the portal calendar can open (date of birth). */
export const PORTAL_FORM_DATE_PAST_YEARS = 120

/** Years after today the portal calendar can open (passport expiry). */
export const PORTAL_FORM_DATE_FUTURE_YEARS = 30

const portalFormDateAnchor = new Date()

/** First month the portal calendar can show. Captured once so render stays pure. */
export const PORTAL_FORM_DATE_START_MONTH = startOfYear(
  subYears(portalFormDateAnchor, PORTAL_FORM_DATE_PAST_YEARS),
)

/** Last month the portal calendar can show. Captured once so render stays pure. */
export const PORTAL_FORM_DATE_END_MONTH = endOfYear(
  addYears(portalFormDateAnchor, PORTAL_FORM_DATE_FUTURE_YEARS),
)
