/** Applicant form fields that drive applicants-tab error chrome. */
export const APPLICATION_DETAIL_APPLICANT_FIELD_KEYS = [
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

/** Trip-tab fields that drive trip-tab error chrome. */
export const APPLICATION_DETAIL_TRIP_FIELD_KEYS = [
  'clientEmail',
  'returnDate',
] as const
