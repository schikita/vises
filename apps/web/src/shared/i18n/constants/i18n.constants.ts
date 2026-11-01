import type { AppLanguage } from '../types'

/** Fallback when no preference is stored and the browser language is not `en` or `ru` (FR-20). */
export const I18N_FALLBACK_LANGUAGE: AppLanguage = 'en'

/** Alias of `I18N_FALLBACK_LANGUAGE` (public API retained). */
export const I18N_DEFAULT_LANGUAGE: AppLanguage = I18N_FALLBACK_LANGUAGE

export const I18N_DEFAULT_NAMESPACE = 'translation' as const
