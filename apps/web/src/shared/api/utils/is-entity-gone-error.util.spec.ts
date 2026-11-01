import { describe, expect, it } from 'vitest'
import { createApiHttpError } from './create-api-http-error.util'
import { isEntityGoneError } from './is-entity-gone-error.util'

describe('isEntityGoneError (AC-19c)', (): void => {
  it('detects HTTP 404 ApiHttpError', (): void => {
    expect(
      isEntityGoneError(createApiHttpError(404, 'client_not_found', {
        detail: 'client_not_found',
      })),
    ).toBe(true)
  })

  it('detects stable not_found detail codes without status', (): void => {
    expect(isEntityGoneError(new Error('application_not_found'))).toBe(true)
    expect(isEntityGoneError('client_not_found')).toBe(true)
    expect(isEntityGoneError({ detail: 'application_not_found' })).toBe(true)
  })

  it('rejects non-404 failures', (): void => {
    expect(
      isEntityGoneError(
        createApiHttpError(500, 'Internal server error', {
          detail: 'Internal server error',
        }),
      ),
    ).toBe(false)
    expect(isEntityGoneError(new Error('forbidden_role'))).toBe(false)
    expect(isEntityGoneError(null)).toBe(false)
  })
})
