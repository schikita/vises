import { I18N_LANGUAGES } from '../constants'
import type { AppLanguage } from '../types'

export const isAppLanguage = (value: unknown): value is AppLanguage => {
  return typeof value === 'string' && (I18N_LANGUAGES as readonly string[]).includes(value)
}
