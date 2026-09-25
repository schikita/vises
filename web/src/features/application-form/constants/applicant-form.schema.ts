import { z } from 'zod'
import { APPLICATION_FORM_MESSAGES } from './form-messages.constants'
import { PASSPORT_ISSUE_COUNTRY_UNIQUE } from './passport-issue-countries.constants'
import { PASSPORT_TYPES } from './passport-types.constants'
import { refineApplicantPassportDates } from '../utils/refine-applicant-passport-dates.util'

/**
 * Soft-required applicant object fields (before date refinements).
 * Exported for detail compose so `.extend` does not drop Core/Extended rules.
 */
export const applicantFormObjectSchema = z.object({
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
  passportIssued: z.string().trim().min(1, APPLICATION_FORM_MESSAGES.passportIssuedRequired),
  passportExpires: z.string().trim().min(1, APPLICATION_FORM_MESSAGES.passportExpiresRequired),
  relationship: z.string().optional(),
  otherNames: z.string().optional(),
  nationalityAtBirth: z.string().optional(),
  nationalId: z.string().optional(),
  // DEC-009: membership vs CON-002 (English portal labels).
  passportType: z.enum(PASSPORT_TYPES, {
    message: APPLICATION_FORM_MESSAGES.passportTypeRequired,
  }),
  // DEC-009/010: CON-003 unique Set membership (Yemen once).
  passportIssueCountry: z.enum(PASSPORT_ISSUE_COUNTRY_UNIQUE, {
    message: APPLICATION_FORM_MESSAGES.passportIssueCountryRequired,
  }),
  passportIssuedBy: z.string().trim().min(1, APPLICATION_FORM_MESSAGES.passportIssuedByRequired),
  email: z.string().optional(),
  phone: z.string().trim().min(1, APPLICATION_FORM_MESSAGES.phoneRequired),
  address: z.string().optional(),
  purpose: z.string().optional(),
  firstEntry: z.string().optional(),
  entries: z.string().optional(),
  durationDays: z.string().optional(),
})

/** Soft-required applicant fields + Core/Extended date rules (e1/e2/e4). */
export const applicantFormSchema = applicantFormObjectSchema.superRefine(
  refineApplicantPassportDates,
)

/** Staff create people-step adds placeOfBirth soft-required (parity with prior canPeople). */
export const staffApplicantFormSchema = applicantFormObjectSchema
  .extend({
    placeOfBirth: z.string().trim().min(1, APPLICATION_FORM_MESSAGES.placeOfBirthRequired),
  })
  .superRefine(refineApplicantPassportDates)
