import type { RolesApplicationsErrorCode } from '@vises/contracts'

/** i18n key for a stable roles-and-applications API error code (FR-19 / FR-20). */
export type RolesApplicationsErrorI18nKey =
  `errors.rolesApplications.${RolesApplicationsErrorCode}`

/** i18n key for API failures (known code or generic fallback). */
export type ApiErrorI18nKey =
  | RolesApplicationsErrorI18nKey
  | 'errors.generic'
