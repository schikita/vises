import { describe, expect, it } from 'vitest'
import { flattenLocaleKeys } from './flatten-locale-keys.util'

describe('flattenLocaleKeys', (): void => {
  it('returns dot paths for nested string leaves', (): void => {
    expect(
      flattenLocaleKeys({
        chrome: { theme: { light: 'Light' } },
        errors: { generic: 'Oops' },
      }),
    ).toEqual(['chrome.theme.light', 'errors.generic'])
  })
})
