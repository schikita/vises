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

/**
 * Path B create body — identity fields only (DEC-ACU / plan §3).
 * No id/status; no trip/payment/visit/manager/code/applicants seeds.
 */
export type AppCreateWrite = {
  clientEmail: string
  clientId?: string
}

/**
 * Body for POST /apps upsert.
 * - Create (Path B): identity-only `AppCreateWrite` (omit `id` / `status`).
 * - Update: partial or full application fields; optional `clientId` ignored on update by API.
 * - Optional `portalWorkflowAction` for staff workflow arming (DEC-015).
 */
export type AppUpsertWrite = Partial<Application> & {
  clientId?: string
  portalWorkflowAction?: 'ensure' | 'supersede' | 'none'
}
