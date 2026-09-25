import { z } from 'zod'
import { staffApplicantFormSchema } from './applicant-form.schema'
import { APPLICATION_FORM_MESSAGES } from './form-messages.constants'
import { staffTripFormSchema } from './trip-form.schema'
import { refineApplicationPassportExpiresVsReturn } from '../utils/refine-application-passport-expires-vs-return.util'

export const staffApplicationFormSchema = staffTripFormSchema
  .extend({
    id: z.string(),
    code: z.string(),
    clientEmail: z
      .string()
      .trim()
      .min(1, APPLICATION_FORM_MESSAGES.clientEmailRequired)
      .email(APPLICATION_FORM_MESSAGES.clientEmailInvalid),
    /** Staff create leaves null; autofill/seed own writes (DEC-004). */
    portalFormEmail: z.string().nullable().optional(),
    status: z.string(),
    destination: z.string(),
    visaType: z.string(),
    returnDate: z.string(),
    applicants: z.array(staffApplicantFormSchema).min(1),
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

export const STAFF_TRIP_STEP_FIELDS = [
  'category',
  'submitCountry',
  'submitCity',
  'submitFrom',
  'submitTo',
  'travelDate',
] as const

export const STAFF_PEOPLE_STEP_FIELDS = ['clientEmail', 'applicants'] as const
