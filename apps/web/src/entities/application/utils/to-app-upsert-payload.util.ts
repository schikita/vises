import type { AppUpsertWrite, Application } from '../types'

/**
 * Body for POST /apps upsert. May include optional portalWorkflowAction for
 * backend compatibility; SPA no longer arms BLS workflows from the UI.
 */
export const toAppUpsertPayload = (
  app: AppUpsertWrite,
): Application & {
  portalWorkflowAction?: 'ensure' | 'supersede' | 'none'
} => {
  const { portalWorkflowAction, ...payload } = app
  return portalWorkflowAction
    ? { ...payload, portalWorkflowAction }
    : payload
}
