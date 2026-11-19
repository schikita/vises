import type { AppUpsertWrite, UpsertAppResult } from '@/entities/application'
import { APPLICATION_CREATE_WRITE } from '../constants'

/**
 * One in-flight blank create. React StrictMode remounts the page effect
 * immediately; both mounts must share this promise so only one application is created.
 */
let inflight: Promise<UpsertAppResult> | null = null

export const startApplicationCreate = (
  upsert: (app: AppUpsertWrite) => Promise<UpsertAppResult>,
): Promise<UpsertAppResult> => {
  if (inflight) {
    return inflight
  }

  const run = upsert(APPLICATION_CREATE_WRITE).finally((): void => {
    if (inflight === run) {
      inflight = null
    }
  })
  inflight = run
  return run
}
