import { z } from 'zod'
import { refineApplicantPassportDates } from '../utils/refine-applicant-passport-dates.util'
import { refineApplicantPhoneDigits } from '../utils/refine-applicant-phone-digits.util'
import { refinePortalConditionals } from '../utils/refine-portal-conditionals.util'
import { refinePortalFingerprint } from '../utils/refine-portal-fingerprint.util'
import { refinePortalInvitingAuthority } from '../utils/refine-portal-inviting-authority.util'
import { refinePortalPassportExpiresVsReturn } from '../utils/refine-portal-passport-expires-vs-return.util'
import { refinePortalTravelArrivalSync } from '../utils/refine-portal-travel-arrival-sync.util'
import { APPLICATION_FORM_MESSAGES } from './form-messages.constants'
import { BLS_INVITING_AUTHORITY_VALUES } from './inviting-authority.constants'
import { PASSPORT_ISSUE_COUNTRY_UNIQUE } from './passport-issue-countries.constants'
import { PASSPORT_TYPES } from './passport-types.constants'
import { portalFormConditionalsObjectSchema } from './portal-form-conditionals.schema'

/**
 * Soft-required object for the staff one-page BLS portal form (PF-TASK-004).
 * Inviting branch + fingerprint + conditionals requiredness is applied via
 * superRefine (DEC-PF-006/007). Completeness key mirror:
 * `bls-applicant-completeness.constants.ts` (API SoT cited there).
 *
 * `intendedArrivalDate` mirrors `travelDate` (same Application store; AC-06).
 * Use `syncIntendedArrivalWithTravelDate` in UI handlers.
 */
export const portalOnePageFormObjectSchema = z.object({
  // Identity / passport
  firstName: z.string().trim().min(1, APPLICATION_FORM_MESSAGES.firstNameRequired),
  lastName: z.string().trim().min(1, APPLICATION_FORM_MESSAGES.lastNameRequired),
  lastNameAtBirth: z
    .string()
    .trim()
    .min(1, APPLICATION_FORM_MESSAGES.lastNameAtBirthRequired),
  dob: z.string().trim().min(1, APPLICATION_FORM_MESSAGES.dobRequired),
  placeOfBirth: z.string(),
  countryOfBirth: z
    .string()
    .trim()
    .min(1, APPLICATION_FORM_MESSAGES.countryOfBirthRequired),
  nationality: z.string(),
  gender: z.enum(['female', 'male']),
  maritalStatus: z.string(),
  otherNames: z.string().optional(),
  nationalityAtBirth: z.string().optional(),
  nationalId: z.string().optional(),
  passportNumber: z
    .string()
    .trim()
    .min(1, APPLICATION_FORM_MESSAGES.passportNumberRequired),
  passportIssued: z
    .string()
    .trim()
    .min(1, APPLICATION_FORM_MESSAGES.passportIssuedRequired),
  passportExpires: z
    .string()
    .trim()
    .min(1, APPLICATION_FORM_MESSAGES.passportExpiresRequired),
  passportType: z.enum(PASSPORT_TYPES, {
    message: APPLICATION_FORM_MESSAGES.passportTypeRequired,
  }),
  passportIssueCountry: z.enum(PASSPORT_ISSUE_COUNTRY_UNIQUE, {
    message: APPLICATION_FORM_MESSAGES.passportIssueCountryRequired,
  }),
  passportIssuedBy: z
    .string()
    .trim()
    .min(1, APPLICATION_FORM_MESSAGES.passportIssuedByRequired),

  // Structured home + phone
  address: z.string().trim().min(1, APPLICATION_FORM_MESSAGES.addressRequired),
  homeAddressLine2: z.string().optional(),
  homeCountry: z
    .string()
    .trim()
    .min(1, APPLICATION_FORM_MESSAGES.homeCountryRequired),
  homeCity: z.string().trim().min(1, APPLICATION_FORM_MESSAGES.homeCityRequired),
  homePostalCode: z
    .string()
    .trim()
    .min(1, APPLICATION_FORM_MESSAGES.homePostalCodeRequired),
  phone: z.string().trim().min(1, APPLICATION_FORM_MESSAGES.phoneRequired),

  // Employer + occupation
  employerName: z
    .string()
    .trim()
    .min(1, APPLICATION_FORM_MESSAGES.employerNameRequired),
  employerPhone: z
    .string()
    .trim()
    .min(1, APPLICATION_FORM_MESSAGES.employerPhoneRequired),
  employerAddress: z
    .string()
    .trim()
    .min(1, APPLICATION_FORM_MESSAGES.employerAddressRequired),
  occupation: z
    .string()
    .trim()
    .min(1, APPLICATION_FORM_MESSAGES.occupationRequired),

  // Travel info
  purpose: z.string().trim().min(1, APPLICATION_FORM_MESSAGES.purposeRequired),
  destination: z
    .string()
    .trim()
    .min(1, APPLICATION_FORM_MESSAGES.destinationRequired),
  firstEntry: z
    .string()
    .trim()
    .min(1, APPLICATION_FORM_MESSAGES.firstEntryRequired),
  entries: z.string().trim().min(1, APPLICATION_FORM_MESSAGES.entriesRequired),
  durationDays: z
    .string()
    .trim()
    .min(1, APPLICATION_FORM_MESSAGES.durationDaysRequired),
  travelDate: z
    .string()
    .trim()
    .min(1, APPLICATION_FORM_MESSAGES.travelDateRequired),
  /** UI twin of travelDate — same Application.travelDate store (AC-06). */
  intendedArrivalDate: z
    .string()
    .trim()
    .min(1, APPLICATION_FORM_MESSAGES.intendedArrivalDateRequired),
  returnDate: z
    .string()
    .trim()
    .min(1, APPLICATION_FORM_MESSAGES.returnDateRequired),
  memberStateSecondDestination: z.string().optional(),

  // Booking
  submitCountry: z
    .string()
    .trim()
    .min(1, APPLICATION_FORM_MESSAGES.submitCountryRequired),
  submitCity: z
    .string()
    .trim()
    .min(1, APPLICATION_FORM_MESSAGES.submitCityRequired),
  visaType: z.string().trim().min(1, APPLICATION_FORM_MESSAGES.visaTypeRequired),
  visaSubType: z
    .string()
    .trim()
    .min(1, APPLICATION_FORM_MESSAGES.visaSubTypeRequired),
  category: z.string().trim().min(1, APPLICATION_FORM_MESSAGES.categoryRequired),

  // Inviting — branch fields optional at object level; refined by authority
  blsInvitingAuthority: z.enum(BLS_INVITING_AUTHORITY_VALUES, {
    message: APPLICATION_FORM_MESSAGES.blsInvitingAuthorityRequired,
  }),
  invitingAuthorityName: z.string(),
  invitingCountry: z.string(),
  invitingCity: z.string(),
  invitingZipCode: z.string(),
  invitingAddress: z.string(),
  invitingEmail: z.string(),
  invitingContactNo: z.string(),
  invitingFaxNo: z.string().optional(),
  invitingContactName: z.string(),
  invitingContactSurname: z.string(),
  invitingContactCountry: z.string(),
  invitingContactCity: z.string(),
  invitingContactZipCode: z.string(),
  invitingContactAddress: z.string(),
  invitingContactContactNo: z.string(),
  invitingContactEmail: z.string(),
  invitingContactFaxNo: z.string().optional(),

  // Cost
  costCoveredBy: z
    .string()
    .trim()
    .min(1, APPLICATION_FORM_MESSAGES.costCoveredByRequired),
  meansOfSupport: z
    .string()
    .trim()
    .min(1, APPLICATION_FORM_MESSAGES.meansOfSupportRequired),

  // Fingerprint — empty status allowed; date refined when status requires
  previousFingerPrintStatus: z.string(),
  previousFingerPrintDate: z.string(),

  // Conditionals bag
  portalFormConditionals: portalFormConditionalsObjectSchema,

  clientEmail: z
    .string()
    .trim()
    .min(1, APPLICATION_FORM_MESSAGES.clientEmailRequired)
    .email(APPLICATION_FORM_MESSAGES.clientEmailInvalid)
    .optional(),
})

export const portalOnePageFormSchema = portalOnePageFormObjectSchema
  .superRefine(refineApplicantPhoneDigits)
  .superRefine(refineApplicantPassportDates)
  .superRefine(refinePortalPassportExpiresVsReturn)
  .superRefine(refinePortalTravelArrivalSync)
  .superRefine(refinePortalInvitingAuthority)
  .superRefine(refinePortalFingerprint)
  .superRefine(refinePortalConditionals)
