import type { z } from 'zod'
import type { portalOnePageFormSchema } from '../constants/portal-one-page-form.schema'

export type PortalOnePageFormValues = z.infer<typeof portalOnePageFormSchema>
