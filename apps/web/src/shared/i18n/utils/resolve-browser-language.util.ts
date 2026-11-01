import { I18N_FALLBACK_LANGUAGE } from '../constants'
import type { AppLanguage } from '../types'
import { isAppLanguage } from './is-app-language.util'

/** Map `navigator.language` / `navigator.languages` to `en` | `ru`, else fallback (FR-20). */
export const resolveBrowserLanguage = (): AppLanguage => {
  if (typeof navigator === 'undefined') {
    return I18N_FALLBACK_LANGUAGE
  }

  const candidates: string[] = []
  if (typeof navigator.language === 'string' && navigator.language.length > 0) {
    candidates.push(navigator.language)
  }
  if (Array.isArray(navigator.languages)) {
    for (const entry of navigator.languages) {
      if (typeof entry === 'string' && entry.length > 0) {
        candidates.push(entry)
      }
    }
  }

  for (const candidate of candidates) {
    const base = candidate.toLowerCase().split('-')[0]
    if (isAppLanguage(base)) {
      return base
    }
  }

  return I18N_FALLBACK_LANGUAGE
}
