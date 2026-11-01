import { afterEach, describe, expect, it, vi } from 'vitest'
import { resolveEffectiveTheme } from './resolve-effective-theme.util'

describe('resolveEffectiveTheme', (): void => {
  afterEach((): void => {
    vi.unstubAllGlobals()
  })

  it('returns light and dark modes unchanged', (): void => {
    expect(resolveEffectiveTheme('light')).toBe('light')
    expect(resolveEffectiveTheme('dark')).toBe('dark')
  })

  it('resolves system mode from prefers-color-scheme', (): void => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockImplementation((query: string) => ({
        matches: query.includes('dark'),
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    )
    expect(resolveEffectiveTheme('system')).toBe('dark')
  })
})
