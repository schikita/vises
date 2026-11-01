import { describe, expect, it } from 'vitest'
import { formatPaymentAmountDisplay } from './format-payment-amount-display.util'

describe('formatPaymentAmountDisplay (AC-21)', (): void => {
  it('keeps decimal strings as-is without float re-round', (): void => {
    expect(formatPaymentAmountDisplay('199.99')).toBe('199.99')
    expect(formatPaymentAmountDisplay('0.10')).toBe('0.10')
  })

  it('stringifies finite numbers without Intl reformat', (): void => {
    expect(formatPaymentAmountDisplay(180)).toBe('180')
    expect(formatPaymentAmountDisplay(180.5)).toBe('180.5')
  })

  it('returns empty for non-numeric values', (): void => {
    expect(formatPaymentAmountDisplay(undefined)).toBe('')
    expect(formatPaymentAmountDisplay(null)).toBe('')
    expect(formatPaymentAmountDisplay(Number.NaN)).toBe('')
  })
})
