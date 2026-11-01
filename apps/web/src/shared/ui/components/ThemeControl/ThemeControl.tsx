import { useTranslation } from 'react-i18next'
import { THEME_MODES, useTheme, type ThemeMode } from '@/shared/theme'
import {
  THEME_CONTROL_GROUP_CLASS,
  THEME_CONTROL_OPTION_ACTIVE_CLASS,
  THEME_CONTROL_OPTION_BASE_CLASS,
  THEME_CONTROL_OPTION_INACTIVE_CLASS,
} from './theme-control.constants'
import type { ThemeControlLabels, ThemeControlProps } from './theme-control.types'

export const ThemeControl = (props: ThemeControlProps): React.ReactElement => {
  const { className = '', labels: labelsProp, ariaLabel: ariaLabelProp } = props
  const { t } = useTranslation()
  const { mode, setMode } = useTheme()

  const labels: ThemeControlLabels = labelsProp ?? {
    light: t('chrome.theme.light'),
    dark: t('chrome.theme.dark'),
    system: t('chrome.theme.system'),
  }
  const ariaLabel = ariaLabelProp ?? t('chrome.theme.ariaLabel')

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={`${THEME_CONTROL_GROUP_CLASS} ${className}`.trim()}
    >
      {THEME_MODES.map((option: ThemeMode): React.ReactElement => {
        const active = mode === option
        return (
          <button
            key={option}
            type="button"
            aria-pressed={active}
            className={`${THEME_CONTROL_OPTION_BASE_CLASS} ${active ? THEME_CONTROL_OPTION_ACTIVE_CLASS : THEME_CONTROL_OPTION_INACTIVE_CLASS}`}
            onClick={(): void => {
              setMode(option)
            }}
          >
            {labels[option]}
          </button>
        )
      })}
    </div>
  )
}
