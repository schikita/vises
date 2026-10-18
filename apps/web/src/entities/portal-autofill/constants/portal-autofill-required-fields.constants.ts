import type { Applicant } from '@/entities/application'

export const PORTAL_AUTOFILL_REQUIRED_FIELDS: (keyof Applicant)[] = [
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
]
