import type { AppUpsertWrite, Application } from '../types'

/**
 * Body for POST /apps upsert: drop read-only embeds the API forbids on write
 * (`portalProgress` is computed on read only). Forwards `visaSubType` with the
 * rest of Application write fields. May include portalWorkflowAction.
 * Does not treat `applicants[]` as SoT for portal-extended Client fields.
 */
export const toAppUpsertPayload = (
  app: AppUpsertWrite,
): Omit<Application, 'portalProgress'> & {
  portalWorkflowAction?: 'ensure' | 'supersede' | 'none'
} => {
  const {
    portalProgress: _portalProgress,
    portalWorkflowAction,
    ...payload
  } = app
  return portalWorkflowAction
    ? { ...payload, portalWorkflowAction }
    : payload
}
