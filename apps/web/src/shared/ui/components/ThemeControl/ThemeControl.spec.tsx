import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { render, screen, userEvent } from '@/shared/testing'
import { i18n } from '@/shared/i18n'
import { THEME_STORAGE_KEY, ThemeProvider } from '@/shared/theme'
import { ThemeControl } from './ThemeControl'

describe('ThemeControl', (): void => {
  beforeEach(async (): Promise<void> => {
    await i18n.changeLanguage('en')
  })

  afterEach((): void => {
    window.localStorage.removeItem(THEME_STORAGE_KEY)
    document.documentElement.classList.remove('dark')
    delete document.documentElement.dataset.theme
  })

  it('persists light/dark/system preference when selected', async (): Promise<void> => {
    const user = userEvent.setup()
    render(
      <ThemeProvider>
        <ThemeControl />
      </ThemeProvider>,
    )

    await user.click(screen.getByRole('button', { name: 'Dark' }))
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)

    await user.click(screen.getByRole('button', { name: 'Light' }))
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('light')
    expect(document.documentElement.classList.contains('dark')).toBe(false)

    await user.click(screen.getByRole('button', { name: 'System' }))
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('system')
  })
})
