import { z } from 'zod'
import { AUTH_LOGIN_MESSAGES } from './auth-login-messages.constants'

export const authLoginFormSchema = z.object({
  login: z.string().trim().min(1, AUTH_LOGIN_MESSAGES.loginRequired),
  password: z.string().min(1, AUTH_LOGIN_MESSAGES.passwordRequired),
})
