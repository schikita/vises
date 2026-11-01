import { extractRolesApplicationsErrorCode } from './extract-roles-applications-error-code.util'
import { isApiHttpError } from './is-api-http-error.util'

const ENTITY_GONE_DETAIL_CODES = new Set([
  'client_not_found',
  'application_not_found',
])

/**
 * True when a detail/mutation failure means the entity is gone (AC-19c):
 * HTTP 404, or stable `*_not_found` roles-applications codes.
 */
export const isEntityGoneError = (error: unknown): boolean => {
  if (isApiHttpError(error) && error.status === 404) {
    return true
  }

  if (
    typeof error === 'string' &&
    ENTITY_GONE_DETAIL_CODES.has(error)
  ) {
    return true
  }

  if (
    error instanceof Error &&
    ENTITY_GONE_DETAIL_CODES.has(error.message)
  ) {
    return true
  }

  const fromBody = extractRolesApplicationsErrorCode(
    isApiHttpError(error) ? error.body : error,
  )
  return fromBody !== undefined && ENTITY_GONE_DETAIL_CODES.has(fromBody)
}
