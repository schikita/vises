import type { ApplicantFieldsSection } from '../types'

/** Maps an applicant date field to its ApplicantFields section chrome (REQ-007). */
export const mapApplicantDateFieldToSection = (
  fieldKey: string,
): Extract<ApplicantFieldsSection, 'personal' | 'documents'> | undefined => {
  if (fieldKey === 'dob') return 'personal'
  if (fieldKey === 'passportIssued' || fieldKey === 'passportExpires') return 'documents'
  return undefined
}
