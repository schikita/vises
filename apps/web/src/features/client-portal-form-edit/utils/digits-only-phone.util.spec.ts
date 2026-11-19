import { describe, expect, it } from 'vitest'
import { digitsOnlyPhone } from './digits-only-phone.util'

describe('digitsOnlyPhone', (): void => {
  it('strips every non-digit, including the country code', (): void => {
    expect(digitsOnlyPhone('+34 600-000-000')).toBe('34600000000')
    expect(digitsOnlyPhone('+34 600 000 000')).toBe('34600000000')
  })

  it('leaves an empty string empty', (): void => {
    expect(digitsOnlyPhone('')).toBe('')
  })
})
