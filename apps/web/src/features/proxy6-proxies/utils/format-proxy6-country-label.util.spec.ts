import { describe, expect, it } from 'vitest'
import { formatProxy6CountryLabel } from './format-proxy6-country-label.util'

describe('formatProxy6CountryLabel', (): void => {
  it('renders localized name with raw Proxy6 code', (): void => {
    expect(formatProxy6CountryLabel('tr', 'en')).toMatch(/\(tr\)$/)
    expect(formatProxy6CountryLabel('tr', 'en')).not.toBe('tr')
    expect(formatProxy6CountryLabel('by', 'ru')).toMatch(/\(by\)$/)
  })

  it('falls back to the raw code when region is unknown', (): void => {
    expect(formatProxy6CountryLabel('zz', 'en')).toBe('zz')
  })
})
