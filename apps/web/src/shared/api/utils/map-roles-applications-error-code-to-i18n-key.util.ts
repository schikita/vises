import type { RolesApplicationsErrorCode } from '@vises/contracts'
import { ROLES_APPLICATIONS_ERROR_I18N_KEYS } from '../constants/roles-applications-error-i18n-keys.constants'
import type { RolesApplicationsErrorI18nKey } from '../types/api-error-i18n-key.types'

export const mapRolesApplicationsErrorCodeToI18nKey = (
  code: RolesApplicationsErrorCode,
): RolesApplicationsErrorI18nKey => ROLES_APPLICATIONS_ERROR_I18N_KEYS[code]
