import { I18N_STORAGE_KEY } from '../constants'
import type { AppLanguage } from '../types'

export const writeLanguagePreference = (language: AppLanguage): void => {
  if (typeof window === 'undefined') {
    return
  }
  try {
    window.localStorage.setItem(I18N_STORAGE_KEY, language)
  } catch {
    // Preference persistence is best-effort (private mode / quota).
  }
}
