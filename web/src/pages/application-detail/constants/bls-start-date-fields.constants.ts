/**
 * Start Completeness (+ date) applicant field keys for Dialog / tab / applicant chrome
 * (DEC-005). Supersedes exclusive use of date-only keys for Start gate helpers.
 */
export const APPLICATION_DETAIL_START_APPLICANT_FIELD_KEYS = [
  'firstName',
  'lastName',
  'lastNameAtBirth',
  'dob',
  'countryOfBirth',
  'passportNumber',
  'passportIssued',
  'passportExpires',
  'passportType',
  'passportIssueCountry',
  'passportIssuedBy',
  'phone',
] as const

/**
 * Application-level Start fields owned by the trip tab chrome (`clientEmail` Completeness;
 * `returnDate` for Extended e3).
 */
export const APPLICATION_DETAIL_START_TRIP_FIELD_KEYS = [
  'clientEmail',
  'returnDate',
] as const

/** Date-only subset retained for callers that need Core/Extended paths alone. */
export const APPLICATION_DETAIL_START_DATE_FIELD_KEYS = [
  'dob',
  'passportIssued',
  'passportExpires',
] as const

/**
 * Matches backend `BLS_APPLICANT_DATE_DETAIL_SEPARATOR` / Completeness separator for API Dialog lists (DEC-006).
 */
export const APPLICATION_DETAIL_START_API_DETAIL_SEPARATOR = '; '
