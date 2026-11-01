export {
  CHROME_I18N_KEYS,
  CRITICAL_I18N_KEYS,
  EN_LOCALE,
  I18N_DEFAULT_LANGUAGE,
  I18N_DEFAULT_NAMESPACE,
  I18N_FALLBACK_LANGUAGE,
  I18N_LANGUAGES,
  I18N_STORAGE_KEY,
  RU_LOCALE,
} from './constants'
export type { AppLanguage } from './types'
export {
  applyDocumentLanguage,
  bootstrapI18n,
  flattenLocaleKeys,
  i18n,
  initI18n,
  isAppLanguage,
  readLanguagePreference,
  resolveActiveLanguage,
  resolveBrowserLanguage,
  writeLanguagePreference,
} from './utils'
