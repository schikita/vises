/**
 * FR-6 passport field keys for edit form (match ClientPassportUpdateDto).
 * Order: personal then travel document.
 */
export const CLIENT_PASSPORT_FORM_FIELDS = [
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
