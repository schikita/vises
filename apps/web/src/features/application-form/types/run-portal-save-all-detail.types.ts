import type { AppUpsertWrite, Application, UpsertAppResult } from '@/entities/application'
import type { PortalOnePageFormValues } from './portal-one-page-form.types'

export type RunPortalSaveAllDetailInput = {
  clientId: string
  values: PortalOnePageFormValues
  application: Application
  upsert: (app: AppUpsertWrite) => Promise<UpsertAppResult>
}
