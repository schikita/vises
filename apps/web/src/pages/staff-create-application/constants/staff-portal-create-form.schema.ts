import { z } from 'zod'
import {
  APPLICATION_FORM_MESSAGES,
  portalOnePageFormSchema,
} from '@/features/application-form'

/** One-page create: portal schema + required client email for apps upsert identity. */
export const staffPortalCreateFormSchema = portalOnePageFormSchema.superRefine(
  (data, ctx): void => {
    const email = data.clientEmail?.trim() ?? ''
    if (!email) {
      ctx.addIssue({
        code: 'custom',
        path: ['clientEmail'],
        message: APPLICATION_FORM_MESSAGES.clientEmailRequired,
      })
      return
    }
    const parsed = z.string().email().safeParse(email)
    if (!parsed.success) {
      ctx.addIssue({
        code: 'custom',
        path: ['clientEmail'],
        message: APPLICATION_FORM_MESSAGES.clientEmailInvalid,
      })
    }
  },
)
