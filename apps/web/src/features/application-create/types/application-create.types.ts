import type { AppUpsertWrite, UpsertAppResult } from '@/entities/application'

export type ApplicationCreateProps = {
  upsert: (app: AppUpsertWrite) => Promise<UpsertAppResult>
  /** Fired after a blank application exists and has a CRM client id. */
  onCreated: (result: UpsertAppResult) => void
}
