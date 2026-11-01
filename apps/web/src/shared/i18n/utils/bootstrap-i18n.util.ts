import i18next from 'i18next'
import { initI18n } from './init-i18n.util'

/** Idempotent i18n bootstrap; returns the shared i18next instance (mirrors `bootstrapTheme`). */
export const bootstrapI18n = (): typeof i18next => {
  return initI18n()
}

/** Shared i18next singleton — call `bootstrapI18n()` at app/test entry before use. */
export { default as i18n } from 'i18next'
