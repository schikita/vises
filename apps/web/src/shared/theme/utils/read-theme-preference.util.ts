import { THEME_DEFAULT_MODE, THEME_STORAGE_KEY } from '../constants'
import type { ThemeMode } from '../types'
import { isThemeMode } from './is-theme-mode.util'

export const readThemePreference = (): ThemeMode => {
  if (typeof window === 'undefined') {
    return THEME_DEFAULT_MODE
  }
  try {
    const raw = window.localStorage.getItem(THEME_STORAGE_KEY)
    if (isThemeMode(raw)) {
      return raw
    }
  } catch {
    return THEME_DEFAULT_MODE
  }
  return THEME_DEFAULT_MODE
}
