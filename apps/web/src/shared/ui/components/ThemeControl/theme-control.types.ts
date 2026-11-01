import type { ThemeMode } from '@/shared/theme'

export type ThemeControlLabels = Record<ThemeMode, string>

export type ThemeControlProps = {
  className?: string
  labels?: ThemeControlLabels
  ariaLabel?: string
}
