import { z } from 'zod'
import { applicantFormSchema } from './applicant-form.schema'
import { clientTripFormSchema } from './trip-form.schema'
import { refineApplicationPassportExpiresVsReturn } from '../utils/refine-application-passport-expires-vs-return.util'

/** Full client new-application form (Application-shaped subset + required trip/person). */
export const clientApplicationFormSchema = clientTripFormSchema
  .extend({
    id: z.string(),
    code: z.string(),
    clientEmail: z.string(),
    /** Client create leaves null; ignored on client screens (DEC-004). */
    portalFormEmail: z.string().nullable().optional(),
    status: z.string(),
    category: z.string().optional(),
    submitFrom: z.string().optional(),
    submitTo: z.string().optional(),
    paused: z.boolean().optional(),
    transfer: z.boolean().optional(),
    applicants: z.array(applicantFormSchema).min(1),
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

export const CLIENT_TRIP_STEP_FIELDS = [
  'travelDate',
  'returnDate',
] as const satisfies ReadonlyArray<keyof z.infer<typeof clientTripFormSchema>>

export const CLIENT_PERSON_STEP_FIELDS = [
  'applicants.0.firstName',
  'applicants.0.lastName',
  'applicants.0.lastNameAtBirth',
  'applicants.0.dob',
  'applicants.0.passportNumber',
  'applicants.0.passportIssued',
  'applicants.0.passportExpires',
  'applicants.0.passportType',
  'applicants.0.passportIssueCountry',
  'applicants.0.passportIssuedBy',
  'applicants.0.phone',
] as const
