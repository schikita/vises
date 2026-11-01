import { GENERIC_API_ERROR_I18N_KEY } from '../constants/generic-api-error-i18n-key.constants'
import type { ApiErrorI18nKey } from '../types/api-error-i18n-key.types'
import { extractRolesApplicationsErrorCode } from './extract-roles-applications-error-code.util'
import { isApiHttpError } from './is-api-http-error.util'
import { isRolesApplicationsErrorCode } from './is-roles-applications-error-code.util'
import { mapRolesApplicationsErrorCodeToI18nKey } from './map-roles-applications-error-code-to-i18n-key.util'

/**
 * Resolve UI copy via i18n key only — never returns raw API English/`detail` text.
 * Accepts a Nest body, a thrown `Error.message` (often the detail code), or unknown.
 */
export const resolveApiErrorI18nKey = (source: unknown): ApiErrorI18nKey => {
  if (typeof source === 'string' && isRolesApplicationsErrorCode(source)) {
    return mapRolesApplicationsErrorCodeToI18nKey(source)
  }

  if (source instanceof Error && isRolesApplicationsErrorCode(source.message)) {
    return mapRolesApplicationsErrorCodeToI18nKey(source.message)
  }

  if (isApiHttpError(source)) {
    const fromHttpBody = extractRolesApplicationsErrorCode(source.body)
    if (fromHttpBody !== undefined) {
      return mapRolesApplicationsErrorCodeToI18nKey(fromHttpBody)
    }
    if (isRolesApplicationsErrorCode(source.message)) {
      return mapRolesApplicationsErrorCodeToI18nKey(source.message)
    }
    return GENERIC_API_ERROR_I18N_KEY
  }

  const fromBody = extractRolesApplicationsErrorCode(source)
  if (fromBody !== undefined) {
    return mapRolesApplicationsErrorCodeToI18nKey(fromBody)
  }

  return GENERIC_API_ERROR_I18N_KEY
}
