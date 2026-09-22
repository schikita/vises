import { z } from 'zod'
import { applicantFormSchema } from './applicant-form.schema'

/**
 * Detail edit: structured Application fields via RHF.
 * Soft-required parity — detail previously saved without blocking field checks,
 * so applicant min-length rules apply only when those fields are non-empty edits
 * are still allowed empty via optional softening below.
 */
export const applicationDetailFormSchema = z.object({
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
  applicants: z.array(
    applicantFormSchema.extend({
      firstName: z.string(),
      lastName: z.string(),
      lastNameAtBirth: z.string(),
      dob: z.string(),
      passportNumber: z.string(),
      passportType: z.string(),
      passportIssuedBy: z.string(),
      phone: z.string(),
    }),
  ),
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
