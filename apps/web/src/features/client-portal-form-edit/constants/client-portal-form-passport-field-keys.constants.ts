/**
 * FR-6 identity/passport form keys (match ClientPassportUpdateDto).
 * Duplicated here — features must not import sibling feature slices.
 */
export const PORTAL_FORM_PASSPORT_FIELD_KEYS = [
  'firstName',
  'lastName',
  'lastNameAtBirth',
  'otherNames',
  'dob',
  'placeOfBirth',
  'countryOfBirth',
  'nationality',
  'nationalityAtBirth',
  'nationalId',
  'gender',
  'maritalStatus',
  'passportType',
  'passportNumber',
  'passportIssued',
  'passportExpires',
  'passportIssuedBy',
  'passportIssueCountry',
] as const
