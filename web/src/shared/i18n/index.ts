import { initI18n } from './utils'

export { I18N_DEFAULT_LANGUAGE, I18N_DEFAULT_NAMESPACE, RU_LOCALE } from './constants'
export { initI18n } from './utils'

/** Side-effect bootstrap for app entry (import `@/shared/i18n` in main). */
export const i18n = initI18n()
