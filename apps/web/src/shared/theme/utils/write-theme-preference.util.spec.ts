import { afterEach, describe, expect, it } from 'vitest'
import { THEME_STORAGE_KEY } from '../constants'
import { writeThemePreference } from './write-theme-preference.util'

describe('writeThemePreference', (): void => {
  afterEach((): void => {
    window.localStorage.removeItem(THEME_STORAGE_KEY)
  })

  it('persists the chosen theme mode', (): void => {
    writeThemePreference('dark')
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark')
  })
})
