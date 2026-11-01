import {
  ROLES_APPLICATIONS_ERROR_CODES,
  type RolesApplicationsErrorCode,
} from '@vises/contracts'

const ROLES_APPLICATIONS_ERROR_CODE_SET: ReadonlySet<string> = new Set(
  ROLES_APPLICATIONS_ERROR_CODES,
)

export const isRolesApplicationsErrorCode = (
  value: unknown,
): value is RolesApplicationsErrorCode =>
  typeof value === 'string' && ROLES_APPLICATIONS_ERROR_CODE_SET.has(value)
