import { I18N_STORAGE_KEY } from '../constants'
import type { AppLanguage } from '../types'
import { isAppLanguage } from './is-app-language.util'
import { resolveBrowserLanguage } from './resolve-browser-language.util'

/**
 * Stored language preference, or browser `en`/`ru`, or fallback `en` (FR-20 / NFR-7).
 */
export const readLanguagePreference = (): AppLanguage => {
  if (typeof window !== 'undefined') {
    try {
      const raw = window.localStorage.getItem(I18N_STORAGE_KEY)
      if (isAppLanguage(raw)) {
        return raw
      }
    } catch {
      return resolveBrowserLanguage()
    }
  }
  return resolveBrowserLanguage()
}
