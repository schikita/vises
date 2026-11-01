import { z } from 'zod'

/** All FR-6 passport edit fields are optional free-text strings. */
export const clientPassportFormSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  lastNameAtBirth: z.string(),
  otherNames: z.string(),
  dob: z.string(),
  placeOfBirth: z.string(),
  countryOfBirth: z.string(),
  nationality: z.string(),
  nationalityAtBirth: z.string(),
  nationalId: z.string(),
  gender: z.string(),
  maritalStatus: z.string(),
  passportType: z.string(),
  passportNumber: z.string(),
  passportIssued: z.string(),
  passportExpires: z.string(),
  passportIssuedBy: z.string(),
  passportIssueCountry: z.string(),
})
