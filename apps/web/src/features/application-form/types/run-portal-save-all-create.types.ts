import type { AppUpsertWrite, Application, UpsertAppResult } from '@/entities/application'
import type { PortalOnePageFormValues } from './portal-one-page-form.types'
import type { PortalSaveAllFailure } from './portal-save-all-step.types'

export type RunPortalSaveAllCreateInput = {
  values: PortalOnePageFormValues
  /** Base Application draft (id/code/manager/payment/timeline) before first upsert. */
  draftApplication: Application
  /**
   * DEC-PF-011: existing CRM Client id when picker selected.
   * Empty/omitted → apps upsert creates Client + debit; never send synthetic ids.
   */
  selectedClientId?: string | null
  upsert: (app: AppUpsertWrite) => Promise<UpsertAppResult>
}

export type PortalSaveAllCreateSuccess = {
  ok: true
  saved: UpsertAppResult
}

export type PortalSaveAllCreateResult =
  | PortalSaveAllCreateSuccess
  | PortalSaveAllFailure
