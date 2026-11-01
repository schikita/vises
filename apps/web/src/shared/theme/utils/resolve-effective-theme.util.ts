import type { EffectiveTheme, ThemeMode } from '../types'
import { getSystemColorScheme } from './get-system-color-scheme.util'

export const resolveEffectiveTheme = (mode: ThemeMode): EffectiveTheme => {
  if (mode === 'system') {
    return getSystemColorScheme()
  }
  return mode
}
