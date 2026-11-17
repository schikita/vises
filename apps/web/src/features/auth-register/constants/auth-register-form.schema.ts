import { z } from 'zod'
import { AUTH_REGISTER_MESSAGES } from './auth-register-messages.constants'

export const authRegisterFormSchema = z.object({
  name: z.string().trim().min(1, AUTH_REGISTER_MESSAGES.nameRequired),
  login: z.string().trim().min(1, AUTH_REGISTER_MESSAGES.loginRequired),
  email: z
    .string()
    .trim()
    .refine((value): boolean => {
      if (value.length === 0) return true
      return z.string().email().safeParse(value).success
    }, AUTH_REGISTER_MESSAGES.emailInvalid),
  password: z.string().min(1, AUTH_REGISTER_MESSAGES.passwordRequired),
})
