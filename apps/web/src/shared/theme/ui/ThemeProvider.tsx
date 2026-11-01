import { useEffect, useState } from 'react'
import { ThemeContext } from '../model/theme-context'
import type { EffectiveTheme, ThemeMode } from '../types'
import {
  applyDocumentTheme,
  getSystemColorScheme,
  readThemePreference,
  resolveEffectiveTheme,
  writeThemePreference,
} from '../utils'
import type { ThemeProviderProps } from './theme-provider.types'

export const ThemeProvider = (props: ThemeProviderProps): React.ReactElement => {
  const [mode, setModeState] = useState<ThemeMode>(() => readThemePreference())
  const [systemScheme, setSystemScheme] = useState<EffectiveTheme>(() => getSystemColorScheme())
  const effective: EffectiveTheme = mode === 'system' ? systemScheme : mode

  useEffect((): void => {
    applyDocumentTheme(mode, effective)
  }, [mode, effective])

  useEffect((): (() => void) | undefined => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return undefined
    }
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = (): void => {
      setSystemScheme(getSystemColorScheme())
    }
    media.addEventListener('change', onChange)
    return (): void => {
      media.removeEventListener('change', onChange)
    }
  }, [])

  const setMode = (next: ThemeMode): void => {
    writeThemePreference(next)
    const nextEffective = resolveEffectiveTheme(next)
    applyDocumentTheme(next, nextEffective)
    setModeState(next)
  }

  return (
    <ThemeContext.Provider value={{ mode, effective, setMode }}>
      {props.children}
    </ThemeContext.Provider>
  )
}
