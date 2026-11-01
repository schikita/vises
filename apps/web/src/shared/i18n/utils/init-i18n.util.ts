import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import {
  EN_LOCALE,
  I18N_DEFAULT_NAMESPACE,
  I18N_FALLBACK_LANGUAGE,
  RU_LOCALE,
} from '../constants'
import { applyDocumentLanguage } from './apply-document-language.util'
import { readLanguagePreference } from './read-language-preference.util'

/** Initialize i18next once with `en` / `ru` resources (FR-20). */
export const initI18n = (): typeof i18n => {
  if (!i18n.isInitialized) {
    const lng = readLanguagePreference()
    void i18n.use(initReactI18next).init({
      resources: {
        en: {
          [I18N_DEFAULT_NAMESPACE]: EN_LOCALE,
        },
        ru: {
          [I18N_DEFAULT_NAMESPACE]: RU_LOCALE,
        },
      },
      lng,
      fallbackLng: I18N_FALLBACK_LANGUAGE,
      defaultNS: I18N_DEFAULT_NAMESPACE,
      interpolation: { escapeValue: false },
      returnNull: false,
    })
    applyDocumentLanguage(lng)
  }
  return i18n
}
