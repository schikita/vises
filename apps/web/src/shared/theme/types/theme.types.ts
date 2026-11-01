export type ThemeMode = 'light' | 'dark' | 'system'

export type EffectiveTheme = 'light' | 'dark'

export type ThemeContextValue = {
  mode: ThemeMode
  effective: EffectiveTheme
  setMode: (mode: ThemeMode) => void
}
