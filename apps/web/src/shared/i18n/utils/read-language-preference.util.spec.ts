import { afterEach, describe, expect, it, vi } from 'vitest'
import { I18N_FALLBACK_LANGUAGE, I18N_STORAGE_KEY } from '../constants'
import { readLanguagePreference } from './read-language-preference.util'

describe('readLanguagePreference', (): void => {
  afterEach((): void => {
    window.localStorage.removeItem(I18N_STORAGE_KEY)
    vi.unstubAllGlobals()
  })

  it('returns a stored en preference', (): void => {
    window.localStorage.setItem(I18N_STORAGE_KEY, 'en')
    expect(readLanguagePreference()).toBe('en')
  })

  it('returns a stored ru preference', (): void => {
    window.localStorage.setItem(I18N_STORAGE_KEY, 'ru')
    expect(readLanguagePreference()).toBe('ru')
  })

  it('uses browser language when no preference is stored', (): void => {
    vi.stubGlobal('navigator', {
      language: 'ru-RU',
      languages: ['ru-RU'],
    })
    expect(readLanguagePreference()).toBe('ru')
  })

  it('falls back to en when browser language is unsupported', (): void => {
    vi.stubGlobal('navigator', {
      language: 'de-DE',
      languages: ['de-DE'],
    })
    expect(readLanguagePreference()).toBe(I18N_FALLBACK_LANGUAGE)
  })

  it('ignores invalid stored values and resolves browser/fallback', (): void => {
    window.localStorage.setItem(I18N_STORAGE_KEY, 'fr')
    vi.stubGlobal('navigator', {
      language: 'en-US',
      languages: ['en-US'],
    })
    expect(readLanguagePreference()).toBe('en')
  })
})
