import type { RolesApplicationsErrorCode } from '@vises/contracts'
import type { RolesApplicationsErrorI18nKey } from '../types/api-error-i18n-key.types'

/**
 * Stable error-code → i18n key map (FR-19 / FR-20).
 * UI must `t(key)` these — never show raw API `detail` / English messages as copy.
 */
export const ROLES_APPLICATIONS_ERROR_I18N_KEYS = {
  insufficient_balance: 'errors.rolesApplications.insufficient_balance',
  forbidden_role: 'errors.rolesApplications.forbidden_role',
  superadmin_exists: 'errors.rolesApplications.superadmin_exists',
  illegal_transition: 'errors.rolesApplications.illegal_transition',
  passport_not_unlocked: 'errors.rolesApplications.passport_not_unlocked',
  invalid_amount: 'errors.rolesApplications.invalid_amount',
  reason_required: 'errors.rolesApplications.reason_required',
  not_agent: 'errors.rolesApplications.not_agent',
  client_not_found: 'errors.rolesApplications.client_not_found',
  application_not_found: 'errors.rolesApplications.application_not_found',
} as const satisfies Record<
  RolesApplicationsErrorCode,
  RolesApplicationsErrorI18nKey
>
