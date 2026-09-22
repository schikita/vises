import { z } from 'zod'

/** Soft schema — parity with prior Settings save (empty company/price coerced at submit). */
export const settingsEditFormSchema = z.object({
  company: z.string(),
  price: z.string(),
  destinations: z.string(),
})
