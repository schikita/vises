import type { ApplicantFieldsSection } from '../types'

/**
 * Maps a Start Completeness (+ date) applicant field to ApplicantFields section chrome
 * (DEC-005 / REQ-005).
 */
export const mapApplicantStartFieldToSection = (
  fieldKey: string,
): Extract<ApplicantFieldsSection, 'personal' | 'documents'> | undefined => {
  if (
    fieldKey === 'firstName' ||
    fieldKey === 'lastName' ||
    fieldKey === 'lastNameAtBirth' ||
    fieldKey === 'dob' ||
    fieldKey === 'countryOfBirth' ||
    fieldKey === 'phone'
  ) {
    return 'personal'
  }
  if (
    fieldKey === 'passportNumber' ||
    fieldKey === 'passportIssued' ||
    fieldKey === 'passportExpires' ||
    fieldKey === 'passportType' ||
    fieldKey === 'passportIssueCountry' ||
    fieldKey === 'passportIssuedBy'
  ) {
    return 'documents'
  }
  return undefined
}
