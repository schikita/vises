import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { render, screen, userEvent } from '@/shared/testing'
import {
  I18N_STORAGE_KEY,
  applyDocumentLanguage,
  i18n,
  writeLanguagePreference,
} from '@/shared/i18n'
import { LanguageControl } from './LanguageControl'

describe('LanguageControl', (): void => {
  beforeEach(async (): Promise<void> => {
    window.localStorage.removeItem(I18N_STORAGE_KEY)
    writeLanguagePreference('en')
    applyDocumentLanguage('en')
    await i18n.changeLanguage('en')
  })

  afterEach(async (): Promise<void> => {
    window.localStorage.removeItem(I18N_STORAGE_KEY)
    applyDocumentLanguage('en')
    await i18n.changeLanguage('en')
  })

  it('persists language preference when selected (AC-20a)', async (): Promise<void> => {
    const user = userEvent.setup()
    render(<LanguageControl />)

    await user.click(screen.getByRole('button', { name: 'RU' }))
    expect(window.localStorage.getItem(I18N_STORAGE_KEY)).toBe('ru')
    expect(i18n.language).toMatch(/^ru/)
    expect(document.documentElement.lang).toBe('ru')

    await user.click(screen.getByRole('button', { name: 'EN' }))
    expect(window.localStorage.getItem(I18N_STORAGE_KEY)).toBe('en')
    expect(i18n.language).toMatch(/^en/)
    expect(document.documentElement.lang).toBe('en')
  })
})
