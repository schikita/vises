import { THEME_STORAGE_KEY } from '../constants'
import type { ThemeMode } from '../types'

export const writeThemePreference = (mode: ThemeMode): void => {
  if (typeof window === 'undefined') {
    return
  }
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, mode)
  } catch {
    // Preference persistence is best-effort (private mode / quota).
  }
}
