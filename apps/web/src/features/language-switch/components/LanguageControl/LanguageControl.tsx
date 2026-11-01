import { useTranslation } from 'react-i18next'
import {
  applyDocumentLanguage,
  I18N_LANGUAGES,
  resolveActiveLanguage,
  writeLanguagePreference,
  type AppLanguage,
} from '@/shared/i18n'
import {
  LANGUAGE_CONTROL_GROUP_CLASS,
  LANGUAGE_CONTROL_OPTION_ACTIVE_CLASS,
  LANGUAGE_CONTROL_OPTION_BASE_CLASS,
  LANGUAGE_CONTROL_OPTION_INACTIVE_CLASS,
} from './language-control.constants'
import type {
  LanguageControlLabels,
  LanguageControlProps,
} from './language-control.types'

export const LanguageControl = (props: LanguageControlProps): React.ReactElement => {
  const { className = '', labels: labelsProp, ariaLabel: ariaLabelProp } = props
  const { t, i18n } = useTranslation()
  const active = resolveActiveLanguage(i18n.resolvedLanguage ?? i18n.language)

  const labels: LanguageControlLabels = labelsProp ?? {
    en: t('chrome.language.en'),
    ru: t('chrome.language.ru'),
  }
  const ariaLabel = ariaLabelProp ?? t('chrome.language.ariaLabel')

  const setLanguage = (next: AppLanguage): void => {
    writeLanguagePreference(next)
    applyDocumentLanguage(next)
    void i18n.changeLanguage(next)
  }

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={`${LANGUAGE_CONTROL_GROUP_CLASS} ${className}`.trim()}
    >
      {I18N_LANGUAGES.map((option: AppLanguage): React.ReactElement => {
        const isActive = active === option
        return (
          <button
            key={option}
            type="button"
            aria-pressed={isActive}
            className={`${LANGUAGE_CONTROL_OPTION_BASE_CLASS} ${isActive ? LANGUAGE_CONTROL_OPTION_ACTIVE_CLASS : LANGUAGE_CONTROL_OPTION_INACTIVE_CLASS}`}
            onClick={(): void => {
              setLanguage(option)
            }}
          >
            {labels[option]}
          </button>
        )
      })}
    </div>
  )
}
