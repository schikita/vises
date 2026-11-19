import type { AppUpsertWrite } from '@/entities/application'

/**
 * Blank staff create. Applicant email is entered on the portal form, not here.
 * `portalWorkflowAction: 'none'` avoids arming BLS autofill before that form is filled.
 */
export const APPLICATION_CREATE_WRITE = {
  portalWorkflowAction: 'none',
} as const satisfies AppUpsertWrite
