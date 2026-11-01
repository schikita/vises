import { describe, expect, it } from 'vitest'
import { resolveCreateUserAllowedRoles } from './resolve-create-user-allowed-roles.util'

describe('resolveCreateUserAllowedRoles', (): void => {
  it('offers admin+agent for superadmin and never superadmin (AC-6)', (): void => {
    expect(resolveCreateUserAllowedRoles('superadmin')).toEqual(['admin', 'agent'])
    expect(resolveCreateUserAllowedRoles('superadmin')).not.toContain('superadmin')
  })

  it('offers agent only for admin (no create-admin)', (): void => {
    expect(resolveCreateUserAllowedRoles('admin')).toEqual(['agent'])
  })

  it('offers agent only for agent sessions', (): void => {
    expect(resolveCreateUserAllowedRoles('agent')).toEqual(['agent'])
  })
})
