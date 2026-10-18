import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import {
  I18N_DEFAULT_LANGUAGE,
  I18N_DEFAULT_NAMESPACE,
  RU_LOCALE,
} from '../constants'

/** Initialize i18next once with Russian-only resources (DEC-004). */
export const initI18n = (): typeof i18n => {
  if (!i18n.isInitialized) {
    void i18n.use(initReactI18next).init({
      resources: {
        [I18N_DEFAULT_LANGUAGE]: {
          [I18N_DEFAULT_NAMESPACE]: RU_LOCALE,
        },
      },
      lng: I18N_DEFAULT_LANGUAGE,
      fallbackLng: I18N_DEFAULT_LANGUAGE,
      defaultNS: I18N_DEFAULT_NAMESPACE,
      interpolation: { escapeValue: false },
    })
  }
  return i18n
}
