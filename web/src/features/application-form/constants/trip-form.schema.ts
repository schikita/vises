import { z } from 'zod'
import { APPLICATION_FORM_MESSAGES } from './form-messages.constants'

/** Client new-application trip step soft-required dates. */
export const clientTripFormSchema = z.object({
  destination: z.string(),
  visaType: z.string(),
  submitCountry: z.string(),
  submitCity: z.string(),
  travelDate: z.string().trim().min(1, APPLICATION_FORM_MESSAGES.travelDateRequired),
  returnDate: z.string().trim().min(1, APPLICATION_FORM_MESSAGES.returnDateRequired),
  comment: z.string(),
})

/** Staff create trip/submission step soft-required fields. */
export const staffTripFormSchema = z.object({
  category: z.string().trim().min(1, APPLICATION_FORM_MESSAGES.categoryRequired),
  submitCountry: z.string().trim().min(1, APPLICATION_FORM_MESSAGES.submitCountryRequired),
  submitCity: z.string().trim().min(1, APPLICATION_FORM_MESSAGES.submitCityRequired),
  submitFrom: z.string().trim().min(1, APPLICATION_FORM_MESSAGES.submitFromRequired),
  submitTo: z.string().trim().min(1, APPLICATION_FORM_MESSAGES.submitToRequired),
  travelDate: z.string().trim().min(1, APPLICATION_FORM_MESSAGES.travelDateRequired),
  paused: z.boolean(),
  transfer: z.boolean(),
  comment: z.string(),
})
