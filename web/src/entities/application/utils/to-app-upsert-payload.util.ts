import type { Application } from '../types'

/**
 * Body for POST /apps upsert: drop read-only embeds the API forbids on write
 * (`portalProgress` is computed on read only).
 */
export const toAppUpsertPayload = (
  app: Application,
): Omit<Application, 'portalProgress'> => {
  const { portalProgress: _portalProgress, ...payload } = app
  return payload
}
