import type { AppLanguage } from '../types'

export const applyDocumentLanguage = (language: AppLanguage): void => {
  if (typeof document === 'undefined') {
    return
  }
  document.documentElement.lang = language
}
