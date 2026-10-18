import type { Application } from './application.types'
import type { IssuedAccess } from '@/entities/user'

/** Arm payload from DEC-022 AppsUpsertArmResponse. */
export type AppsUpsertArmPayload = {
  applicationId: string
  workflowId?: string
  workflowAction: 'ensure' | 'supersede' | 'none'
  created: boolean
}

/**
 * Upsert HTTP response (envelope + cutover application fields).
 * Prefer `application` when present; fall back to flat Application for interim.
 */
export type UpsertAppResult = Application & {
  correlationId?: string
  payload?: AppsUpsertArmPayload
  issuedClientAccess?: IssuedAccess
}

/** Optional write flag for staff upsert workflow arming (DEC-015). */
export type AppUpsertWrite = Application & {
  portalWorkflowAction?: 'ensure' | 'supersede' | 'none'
}
