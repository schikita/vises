import type { AppUpsertWrite } from '../types'

/**
 * Body for POST /apps upsert. May include optional portalWorkflowAction for
 * backend compatibility; SPA no longer arms BLS workflows from the UI.
 * Create payloads may omit `id` / `status` (server defaults).
 */
export const toAppUpsertPayload = (app: AppUpsertWrite): AppUpsertWrite => {
  const { portalWorkflowAction, ...payload } = app
  return portalWorkflowAction
    ? { ...payload, portalWorkflowAction }
    : payload
}
