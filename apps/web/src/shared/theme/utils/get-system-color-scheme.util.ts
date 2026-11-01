import type { EffectiveTheme } from '../types'

export const getSystemColorScheme = (): EffectiveTheme => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return 'light'
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}
