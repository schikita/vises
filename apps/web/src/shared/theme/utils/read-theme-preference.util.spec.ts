import { afterEach, describe, expect, it } from 'vitest'
import { THEME_DEFAULT_MODE, THEME_STORAGE_KEY } from '../constants'
import { readThemePreference } from './read-theme-preference.util'

describe('readThemePreference', (): void => {
  afterEach((): void => {
    window.localStorage.removeItem(THEME_STORAGE_KEY)
  })

  it('returns system when no preference is stored', (): void => {
    expect(readThemePreference()).toBe(THEME_DEFAULT_MODE)
  })

  it('returns a stored light preference', (): void => {
    window.localStorage.setItem(THEME_STORAGE_KEY, 'light')
    expect(readThemePreference()).toBe('light')
  })

  it('returns a stored dark preference', (): void => {
    window.localStorage.setItem(THEME_STORAGE_KEY, 'dark')
    expect(readThemePreference()).toBe('dark')
  })

  it('ignores invalid stored values', (): void => {
    window.localStorage.setItem(THEME_STORAGE_KEY, 'neon')
    expect(readThemePreference()).toBe(THEME_DEFAULT_MODE)
  })
})
