import { I18N_FALLBACK_LANGUAGE } from '../constants'
import type { AppLanguage } from '../types'
import { isAppLanguage } from './is-app-language.util'

/** Normalize i18next `language` / `resolvedLanguage` to `en` | `ru`. */
export const resolveActiveLanguage = (language: string): AppLanguage => {
  const base = language.toLowerCase().split('-')[0] ?? ''
  if (isAppLanguage(base)) {
    return base
  }
  return I18N_FALLBACK_LANGUAGE
}
