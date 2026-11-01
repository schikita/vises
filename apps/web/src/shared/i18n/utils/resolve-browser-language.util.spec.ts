import { afterEach, describe, expect, it, vi } from 'vitest'
import { I18N_FALLBACK_LANGUAGE } from '../constants'
import { resolveBrowserLanguage } from './resolve-browser-language.util'

describe('resolveBrowserLanguage', (): void => {
  afterEach((): void => {
    vi.unstubAllGlobals()
  })

  it('returns en for en-* browser languages', (): void => {
    vi.stubGlobal('navigator', {
      language: 'en-GB',
      languages: ['en-GB'],
    })
    expect(resolveBrowserLanguage()).toBe('en')
  })

  it('returns ru for ru-* browser languages', (): void => {
    vi.stubGlobal('navigator', {
      language: 'ru',
      languages: ['ru'],
    })
    expect(resolveBrowserLanguage()).toBe('ru')
  })

  it('falls back to en for unsupported browser languages', (): void => {
    vi.stubGlobal('navigator', {
      language: 'pl-PL',
      languages: ['pl-PL', 'de'],
    })
    expect(resolveBrowserLanguage()).toBe(I18N_FALLBACK_LANGUAGE)
  })
})
