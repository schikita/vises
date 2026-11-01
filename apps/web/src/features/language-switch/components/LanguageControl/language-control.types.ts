import type { AppLanguage } from '@/shared/i18n'

export type LanguageControlLabels = Record<AppLanguage, string>

export type LanguageControlProps = {
  className?: string
  labels?: LanguageControlLabels
  ariaLabel?: string
}
