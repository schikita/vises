import { z } from 'zod'
import { AUTH_LOGIN_MESSAGES } from './auth-login-messages.constants'

export const authLoginFormSchema = z.object({
  identifier: z.string().trim().min(1, AUTH_LOGIN_MESSAGES.identifierRequired),
  password: z.string().min(1, AUTH_LOGIN_MESSAGES.passwordRequired),
})
