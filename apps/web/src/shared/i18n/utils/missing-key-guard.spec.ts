import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  CRITICAL_I18N_KEYS,
  EN_LOCALE,
  I18N_LANGUAGES,
  I18N_STORAGE_KEY,
  RU_LOCALE,
  flattenLocaleKeys,
  i18n,
} from '@/shared/i18n'
import { assertLocaleLeavesNonEmpty } from './assert-locale-leaves-non-empty.util'

describe('i18n missing-key guard (AC-20b)', (): void => {
  const enKeys = flattenLocaleKeys(EN_LOCALE)
  const ruKeys = flattenLocaleKeys(RU_LOCALE)

  beforeEach(async (): Promise<void> => {
    window.localStorage.removeItem(I18N_STORAGE_KEY)
    await i18n.changeLanguage('en')
  })

  afterEach(async (): Promise<void> => {
    window.localStorage.removeItem(I18N_STORAGE_KEY)
    await i18n.changeLanguage('en')
    document.documentElement.removeAttribute('lang')
  })

  it('keeps en and ru catalogs on the same key set', (): void => {
    expect([...enKeys].sort()).toEqual([...ruKeys].sort())
  })

  it('keeps every locale leaf as a non-empty string in both catalogs', (): void => {
    assertLocaleLeavesNonEmpty(EN_LOCALE)
    assertLocaleLeavesNonEmpty(RU_LOCALE)
  })

  it('includes every critical chrome and error key in both catalogs', (): void => {
    for (const key of CRITICAL_I18N_KEYS) {
      expect(enKeys).toContain(key)
      expect(ruKeys).toContain(key)
    }
  })

  it('resolves every critical key for both locales (t(key) !== key)', async (): Promise<void> => {
    for (const language of I18N_LANGUAGES) {
      await i18n.changeLanguage(language)
      for (const key of CRITICAL_I18N_KEYS) {
        expect(i18n.t(key), `${language}:${key}`).not.toBe(key)
      }
    }
  })

  it('resolves the full catalog key set for both locales (AC-20b)', async (): Promise<void> => {
    for (const language of I18N_LANGUAGES) {
      await i18n.changeLanguage(language)
      for (const key of enKeys) {
        expect(i18n.t(key), `${language}:${key}`).not.toBe(key)
      }
    }
  })
})
