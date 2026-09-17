import { z } from 'zod'
import { APPLICATION_FORM_MESSAGES } from './form-messages.constants'

/** Soft-required applicant fields shared by client create, staff create, and detail edit. */
export const applicantFormSchema = z.object({
  id: z.string(),
  firstName: z.string().trim().min(1, APPLICATION_FORM_MESSAGES.firstNameRequired),
  lastName: z.string().trim().min(1, APPLICATION_FORM_MESSAGES.lastNameRequired),
  lastNameAtBirth: z.string().trim().min(1, APPLICATION_FORM_MESSAGES.lastNameAtBirthRequired),
  dob: z.string().trim().min(1, APPLICATION_FORM_MESSAGES.dobRequired),
  placeOfBirth: z.string(),
  countryOfBirth: z.string(),
  nationality: z.string(),
  gender: z.enum(['female', 'male']),
  maritalStatus: z.string(),
  passportNumber: z.string().trim().min(1, APPLICATION_FORM_MESSAGES.passportNumberRequired),
  passportIssued: z.string(),
  passportExpires: z.string(),
  relationship: z.string().optional(),
  otherNames: z.string().optional(),
  nationalityAtBirth: z.string().optional(),
  nationalId: z.string().optional(),
  passportType: z.string().trim().min(1, APPLICATION_FORM_MESSAGES.passportTypeRequired),
  passportIssuedBy: z.string().trim().min(1, APPLICATION_FORM_MESSAGES.passportIssuedByRequired),
  email: z.string().optional(),
  phone: z.string().trim().min(1, APPLICATION_FORM_MESSAGES.phoneRequired),
  address: z.string().optional(),
  purpose: z.string().optional(),
  firstEntry: z.string().optional(),
  entries: z.string().optional(),
  durationDays: z.string().optional(),
})

/** Staff create people-step adds placeOfBirth soft-required (parity with prior canPeople). */
export const staffApplicantFormSchema = applicantFormSchema.extend({
  placeOfBirth: z.string().trim().min(1, APPLICATION_FORM_MESSAGES.placeOfBirthRequired),
})
