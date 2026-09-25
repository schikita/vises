import { z } from 'zod'
import { applicantFormObjectSchema } from './applicant-form.schema'
import { refineApplicantPassportDates } from '../utils/refine-applicant-passport-dates.util'
import { refineApplicationPassportExpiresVsReturn } from '../utils/refine-application-passport-expires-vs-return.util'

/**
 * Detail edit: structured Application fields via RHF.
 * Soft-required parity for most applicant fields — detail previously saved
 * without blocking checks — but `dob` / `passportIssued` / `passportExpires`
 * stay hard-required + Core/Extended (DEC-010).
 */
const detailApplicantFormSchema = applicantFormObjectSchema
  .extend({
    firstName: z.string(),
    lastName: z.string(),
    lastNameAtBirth: z.string(),
    passportNumber: z.string(),
    passportType: z.string(),
    passportIssuedBy: z.string(),
    phone: z.string(),
  })
  .superRefine(refineApplicantPassportDates)

export const applicationDetailFormSchema = z
  .object({
    id: z.string(),
    code: z.string(),
    clientEmail: z.string(),
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
    applicants: z.array(detailApplicantFormSchema),
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
