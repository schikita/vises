import { describe, expect, it } from 'vitest'
import { settingsPriceFormSchema } from './settings-price-form.schema'

describe('settingsPriceFormSchema', (): void => {
  it('accepts whole-number decimal strings (AC-13 / AC-21)', (): void => {
    expect(settingsPriceFormSchema.parse({ price_per_client: '180' })).toEqual({
      price_per_client: '180',
    })
    expect(settingsPriceFormSchema.parse({ price_per_client: '180.00' })).toEqual({
      price_per_client: '180.00',
    })
    expect(settingsPriceFormSchema.parse({ price_per_client: '0' })).toEqual({
      price_per_client: '0',
    })
  })

  it('rejects float-like and empty values', (): void => {
    expect(settingsPriceFormSchema.safeParse({ price_per_client: '' }).success).toBe(
      false,
    )
    expect(
      settingsPriceFormSchema.safeParse({ price_per_client: '180.50' }).success,
    ).toBe(false)
    expect(
      settingsPriceFormSchema.safeParse({ price_per_client: '18.5' }).success,
    ).toBe(false)
    expect(
      settingsPriceFormSchema.safeParse({ price_per_client: '-1' }).success,
    ).toBe(false)
  })
})
