/**
 * FR-6 encrypted Client column keys (property names on Client).
 * Must stay aligned with `Client` entity and API `modules/pii` field set.
 */
export const PII_ENCRYPTED_FIELD_KEYS = [
  'passportNumber',
  'passportIssued',
  'passportExpires',
  'passportType',
  'passportIssueCountry',
  'passportIssuedBy',
  'firstName',
  'lastName',
  'lastNameAtBirth',
  'dob',
  'placeOfBirth',
  'countryOfBirth',
  'nationality',
  'nationalityAtBirth',
  'nationalId',
  'otherNames',
  'gender',
  'maritalStatus',
] as const;
