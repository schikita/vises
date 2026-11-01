import { describe, expect, it } from 'vitest'
import { canCreateAdmin } from './can-create-admin.util'

describe('canCreateAdmin', (): void => {
  it('is true only for superadmin (AC-6)', (): void => {
    expect(canCreateAdmin('superadmin')).toBe(true)
    expect(canCreateAdmin('admin')).toBe(false)
    expect(canCreateAdmin('agent')).toBe(false)
  })
})
