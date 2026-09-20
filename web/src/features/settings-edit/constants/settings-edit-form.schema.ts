import { z } from 'zod'

/** Soft schema — parity with prior Settings save (empty company/price coerced at submit). */
export const settingsEditFormSchema = z.object({
  company: z.string(),
  price: z.string(),
  destinations: z.string(),
  websharePlanId: z
    .string()
    .max(120, 'Не более 120 символов'),
})
