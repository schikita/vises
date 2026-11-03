import { z } from 'zod'
import { AUTH_REGISTER_MESSAGES } from './auth-register-messages.constants'

export const authRegisterFormSchema = z.object({
  firstName: z.string().trim(),
  lastName: z.string().trim(),
  login: z.string().trim().min(1, AUTH_REGISTER_MESSAGES.loginRequired),
  email: z
    .string()
    .trim()
    .min(1, AUTH_REGISTER_MESSAGES.emailRequired)
    .email(AUTH_REGISTER_MESSAGES.emailInvalid),
  password: z
    .string()
    .min(1, AUTH_REGISTER_MESSAGES.passwordRequired)
    .min(6, AUTH_REGISTER_MESSAGES.passwordMin),
})
