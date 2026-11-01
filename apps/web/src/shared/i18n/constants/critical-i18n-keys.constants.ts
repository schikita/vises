import {
  ENTITY_GONE_I18N_KEYS,
  GENERIC_API_ERROR_I18N_KEY,
  ROLES_APPLICATIONS_ERROR_I18N_KEYS,
} from '@/shared/api'
import { CHROME_I18N_KEYS } from './chrome-i18n-keys.constants'

/** Chrome + FE1 error keys that must resolve in both `en` and `ru` (AC-20b). */
export const CRITICAL_I18N_KEYS = [
  ...CHROME_I18N_KEYS,
  GENERIC_API_ERROR_I18N_KEY,
  ...Object.values(ENTITY_GONE_I18N_KEYS),
  ...Object.values(ROLES_APPLICATIONS_ERROR_I18N_KEYS),
] as const
