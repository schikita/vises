import type { RolesApplicationsErrorCode } from '@vises/contracts'
import { extractApiErrorDetail } from './extract-api-error-detail.util'
import { isRolesApplicationsErrorCode } from './is-roles-applications-error-code.util'

/** Read a stable roles-and-applications code from a Nest `{ detail }` body, if present. */
export const extractRolesApplicationsErrorCode = (
  data: unknown,
): RolesApplicationsErrorCode | undefined => {
  const detail = extractApiErrorDetail(data)
  if (detail === undefined) return undefined
  if (isRolesApplicationsErrorCode(detail)) return detail
  return undefined
}
