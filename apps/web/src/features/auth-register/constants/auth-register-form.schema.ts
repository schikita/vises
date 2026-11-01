import { z } from 'zod'
import { AUTH_REGISTER_MESSAGES } from './auth-register-messages.constants'

export const authRegisterFormSchema = z.object({
  name: z.string().trim().min(1, AUTH_REGISTER_MESSAGES.nameRequired),
  login: z.string().trim().min(1, AUTH_REGISTER_MESSAGES.loginRequired),
  password: z
    .string()
    .min(1, AUTH_REGISTER_MESSAGES.passwordRequired)
    .min(6, AUTH_REGISTER_MESSAGES.passwordMin),
  email: z.string().trim(),
})
