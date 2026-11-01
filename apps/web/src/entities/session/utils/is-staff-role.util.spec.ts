import { describe, expect, it } from 'vitest'
import { isStaffRole } from './is-staff-role.util'

describe('isStaffRole (FR-1)', (): void => {
  it('accepts only the three-role StaffRole union', (): void => {
    expect(isStaffRole('superadmin')).toBe(true)
    expect(isStaffRole('admin')).toBe(true)
    expect(isStaffRole('agent')).toBe(true)
  })

  it('rejects legacy roles fail-closed', (): void => {
    expect(isStaffRole('client')).toBe(false)
    expect(isStaffRole('manager')).toBe(false)
    expect(isStaffRole('owner')).toBe(false)
    expect(isStaffRole('')).toBe(false)
  })
})
