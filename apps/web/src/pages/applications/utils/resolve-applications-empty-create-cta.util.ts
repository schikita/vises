import type { StaffRole } from '@vises/contracts'
import {
  APPLICATIONS_AGENT_CLIENTS_CREATE_PATH,
  APPLICATIONS_EMPTY_CREATE_CTA_LABEL_KEY,
  APPLICATIONS_STAFF_CREATE_PATH,
} from '../constants/applications-empty-create-cta.constants'
import type { ApplicationsEmptyCreateCtaTarget } from '../types/applications-empty-create-cta.types'

/**
 * Role-correct Applications empty-state create CTA (REQ-ACU-012 / AC-ACU-009).
 * Staff → `/admin/apps/new`; agent → Clients create entry under `/app/clients`.
 */
export const resolveApplicationsEmptyCreateCta = (
  role: StaffRole,
): ApplicationsEmptyCreateCtaTarget => {
  if (role === 'agent') {
    return {
      to: APPLICATIONS_AGENT_CLIENTS_CREATE_PATH,
      labelKey: APPLICATIONS_EMPTY_CREATE_CTA_LABEL_KEY.agent,
    }
  }

  return {
    to: APPLICATIONS_STAFF_CREATE_PATH,
    labelKey: APPLICATIONS_EMPTY_CREATE_CTA_LABEL_KEY.staff,
  }
}
