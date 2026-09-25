import { z } from 'zod'
import { refineApplicantPassportDates } from '../utils/refine-applicant-passport-dates.util'
import { refineApplicantPhoneDigits } from '../utils/refine-applicant-phone-digits.util'
import { refineApplicationPassportExpiresVsReturn } from '../utils/refine-application-passport-expires-vs-return.util'
import { applicantFormObjectSchema } from './applicant-form.schema'
import { APPLICATION_FORM_MESSAGES } from './form-messages.constants'
import { PASSPORT_ISSUE_COUNTRY_UNIQUE } from './passport-issue-countries.constants'

/**
 * BLS Start / supersede gate schema (DEC-002).
 * Hard Completeness + phone 9-digit + clientEmail; reuses Core/Extended date refinements.
 * Detail **save** keeps soft `applicationDetailFormSchema` (DEC-003).
 */
const startApplicantFormSchema = applicantFormObjectSchema
  .extend({
    countryOfBirth: z
      .string()
      .trim()
      .min(1, APPLICATION_FORM_MESSAGES.countryOfBirthRequired),
    // Completeness: non-empty; membership via unique CON-003 set (DEC-009/010).
    passportIssueCountry: z.enum(PASSPORT_ISSUE_COUNTRY_UNIQUE, {
      message: APPLICATION_FORM_MESSAGES.passportIssueCountryRequired,
    }),
  })
  .superRefine(refineApplicantPhoneDigits)
  .superRefine(refineApplicantPassportDates)

export const applicationDetailStartFormSchema = z
  .object({
    id: z.string(),
    code: z.string(),
    clientEmail: z
      .string()
      .trim()
      .min(1, APPLICATION_FORM_MESSAGES.clientEmailRequired),
    /** Read-only on detail; ignored on upsert write (DEC-004). */
    portalFormEmail: z.string().nullable().optional(),
    status: z.string(),
    destination: z.string(),
    visaType: z.string(),
    category: z.string().optional(),
    submitCountry: z.string(),
    submitCity: z.string(),
    submitFrom: z.string().optional(),
    submitTo: z.string().optional(),
    travelDate: z.string(),
    returnDate: z.string(),
    paused: z.boolean().optional(),
    transfer: z.boolean().optional(),
    comment: z.string(),
    applicants: z.array(startApplicantFormSchema),
    documents: z.array(z.unknown()),
    paymentAmount: z.number(),
    paymentPaid: z.boolean(),
    paymentNote: z.string(),
    visitDate: z.string(),
    visitTime: z.string(),
    visitPlace: z.string(),
    manager: z.string(),
    timeline: z.array(z.unknown()),
    createdAt: z.string(),
    updatedAt: z.string(),
  })
  .superRefine(refineApplicationPassportExpiresVsReturn)
