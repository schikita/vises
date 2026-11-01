import type { Application } from '@/entities/application'
import { isApplicationStatus } from '@/entities/application'
import {
  findClientApplicationJoin,
  type ClientApplicationJoin,
} from '@/entities/client'
import type { ApplicationsListRow } from '../types/applications-list-row.types'

export const mapAppToListRow = (
  app: Application,
  joins: ClientApplicationJoin[],
  unnamedFallback: string,
): ApplicationsListRow => {
  const join = findClientApplicationJoin(joins, app.id)
  const clientName = join
    ? [join.firstName, join.lastName].filter(Boolean).join(' ').trim() ||
      unnamedFallback
    : unnamedFallback
  return {
    id: app.id,
    code: app.code,
    status: app.status,
    applicationStatus: isApplicationStatus(app.status) ? app.status : null,
    category: app.category || app.visaType,
    visaType: app.visaType,
    submitCity: app.submitCity,
    travelDate: app.travelDate,
    clientId: join?.clientId ?? null,
    clientName,
  }
}
