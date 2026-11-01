import { THEME_MODES } from '../constants'
import type { ThemeMode } from '../types'

export const isThemeMode = (value: unknown): value is ThemeMode => {
  return typeof value === 'string' && (THEME_MODES as readonly string[]).includes(value)
}
