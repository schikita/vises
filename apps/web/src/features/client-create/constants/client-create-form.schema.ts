import { z } from 'zod'
import { CLIENT_CREATE_MESSAGES } from './client-create-messages.constants'

export const clientCreateFormSchema = z.object({
  email: z
    .string()
    .trim()
    .refine((value): boolean => {
      if (value.length === 0) {
        return true
      }
      return z.string().email().safeParse(value).success
    }, CLIENT_CREATE_MESSAGES.emailInvalid),
  phone: z.string(),
  address: z.string(),
  purpose: z.string(),
})
