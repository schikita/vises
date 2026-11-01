import { ROLES_APPLICATIONS_ERROR_CODES } from '@vises/contracts'
import { describe, expect, it } from 'vitest'
import { GENERIC_API_ERROR_I18N_KEY } from '../constants/generic-api-error-i18n-key.constants'
import { createApiHttpError } from './create-api-http-error.util'
import { mapRolesApplicationsErrorCodeToI18nKey } from './map-roles-applications-error-code-to-i18n-key.util'
import { resolveApiErrorI18nKey } from './resolve-api-error-i18n-key.util'

describe('roles-applications error → i18n mapper', (): void => {
  it('maps every stable code to an errors.rolesApplications.* key (not the raw code)', (): void => {
    for (const code of ROLES_APPLICATIONS_ERROR_CODES) {
      const key = mapRolesApplicationsErrorCodeToI18nKey(code)
      expect(key).toBe(`errors.rolesApplications.${code}`)
      expect(key).not.toBe(code)
    }
  })

  it('resolves Nest detail bodies and Error.message codes to i18n keys', (): void => {
    expect(resolveApiErrorI18nKey({ detail: 'insufficient_balance' })).toBe(
      'errors.rolesApplications.insufficient_balance',
    )
    expect(resolveApiErrorI18nKey(new Error('forbidden_role'))).toBe(
      'errors.rolesApplications.forbidden_role',
    )
  })

  it('falls back to the generic i18n key for unknown / English API text', (): void => {
    expect(resolveApiErrorI18nKey('Internal server error')).toBe(
      GENERIC_API_ERROR_I18N_KEY,
    )
    expect(resolveApiErrorI18nKey({ detail: 'Something went wrong' })).toBe(
      GENERIC_API_ERROR_I18N_KEY,
    )
    expect(resolveApiErrorI18nKey(null)).toBe(GENERIC_API_ERROR_I18N_KEY)
  })

  it('maps ApiHttpError body codes and falls back to generic (AC-19b)', (): void => {
    expect(
      resolveApiErrorI18nKey(
        createApiHttpError(409, 'insufficient_balance', {
          detail: 'insufficient_balance',
        }),
      ),
    ).toBe('errors.rolesApplications.insufficient_balance')
    expect(
      resolveApiErrorI18nKey(
        createApiHttpError(500, 'Internal server error', {
          detail: 'Internal server error',
        }),
      ),
    ).toBe(GENERIC_API_ERROR_I18N_KEY)
  })
})
