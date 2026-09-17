import { uid } from '@/shared/lib'
import type { Applicant } from '../types'

export const emptyApplicant = (relationship = 'Self'): Applicant => {
  return {
    id: uid('p'),
    relationship,
    firstName: '',
    lastName: '',
    lastNameAtBirth: '',
    otherNames: '',
    dob: '',
    placeOfBirth: '',
    countryOfBirth: 'BELARUS',
    nationality: 'BELARUS',
    nationalityAtBirth: 'BELARUS',
    gender: 'female',
    maritalStatus: 'Single',
    nationalId: '',
    passportType: 'Ordinary passport',
    passportNumber: '',
    passportIssued: '',
    passportExpires: '',
    passportIssuedBy: '',
    email: '',
    phone: '',
    address: '',
    purpose: 'Tourism',
    firstEntry: 'Spain',
    entries: 'Multientry',
    durationDays: '90',
  }
}
