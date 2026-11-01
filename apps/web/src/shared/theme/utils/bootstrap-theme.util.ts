import { applyDocumentTheme } from './apply-document-theme.util'
import { readThemePreference } from './read-theme-preference.util'
import { resolveEffectiveTheme } from './resolve-effective-theme.util'
import type { ThemeMode } from '../types'

export const bootstrapTheme = (): ThemeMode => {
  const mode = readThemePreference()
  applyDocumentTheme(mode, resolveEffectiveTheme(mode))
  return mode
}
