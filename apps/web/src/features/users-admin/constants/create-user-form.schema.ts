import { z } from 'zod'
import { CREATE_USER_MESSAGES } from './create-user-messages.constants'

/** Create-user roles — never `superadmin` (AC-6). */
export const CREATE_USER_FORM_ROLES = ['admin', 'agent'] as const

export const createUserFormSchema = z.object({
  name: z.string().trim().min(1, CREATE_USER_MESSAGES.nameRequired),
  email: z.string().trim(),
  login: z.string().trim(),
  role: z.enum(CREATE_USER_FORM_ROLES),
})
