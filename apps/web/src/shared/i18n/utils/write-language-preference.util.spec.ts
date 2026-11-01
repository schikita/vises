import { afterEach, describe, expect, it } from 'vitest'
import { I18N_STORAGE_KEY } from '../constants'
import { writeLanguagePreference } from './write-language-preference.util'

describe('writeLanguagePreference', (): void => {
  afterEach((): void => {
    window.localStorage.removeItem(I18N_STORAGE_KEY)
  })

  it('persists the chosen language', (): void => {
    writeLanguagePreference('ru')
    expect(window.localStorage.getItem(I18N_STORAGE_KEY)).toBe('ru')
  })
})
