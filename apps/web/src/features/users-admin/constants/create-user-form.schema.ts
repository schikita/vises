import { z } from 'zod'
import { CREATE_USER_MESSAGES } from './create-user-messages.constants'

export const createUserFormSchema = z.object({
  name: z.string().trim().min(1, CREATE_USER_MESSAGES.nameRequired),
  email: z.string().trim(),
  login: z.string().trim(),
  role: z.enum(['agent', 'admin']),
})
