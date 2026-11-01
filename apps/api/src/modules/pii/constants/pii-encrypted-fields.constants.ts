/**
 * FR-6 encrypted / anonymized Client column keys (property names on Client).
 * Must stay aligned with `Client` entity and exclude email/phone/address/etc.
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
