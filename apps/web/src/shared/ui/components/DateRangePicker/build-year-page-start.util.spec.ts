import { describe, expect, it } from 'vitest'
import { buildYearPageStart } from './build-year-page-start.util'

describe('buildYearPageStart', (): void => {
  it('aligns years to decade pages', (): void => {
    expect(buildYearPageStart(2026)).toBe(2020)
    expect(buildYearPageStart(2020)).toBe(2020)
    expect(buildYearPageStart(2019)).toBe(2010)
  })
})
