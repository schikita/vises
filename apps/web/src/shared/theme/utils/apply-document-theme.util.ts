import type { EffectiveTheme, ThemeMode } from '../types'

export const applyDocumentTheme = (mode: ThemeMode, effective: EffectiveTheme): void => {
  if (typeof document === 'undefined') {
    return
  }
  const root = document.documentElement
  root.classList.toggle('dark', effective === 'dark')
  root.dataset.theme = mode
  root.style.colorScheme = effective
}
