import { describe, expect, it } from 'vitest'
import { listLegalApplicationStatusTargets } from './list-legal-application-status-targets.util'

describe('listLegalApplicationStatusTargets (FE10 / AC-9)', (): void => {
  it('never offers drafting → pending for staff actors', (): void => {
    expect(listLegalApplicationStatusTargets('drafting', 'admin')).toEqual([])
    expect(listLegalApplicationStatusTargets('drafting', 'superadmin')).toEqual(
      [],
    )
    expect(listLegalApplicationStatusTargets('drafting', 'agent')).toEqual([])
  })

  it('offers drafting → pending only for visa_center_monitor', (): void => {
    expect(
      listLegalApplicationStatusTargets('drafting', 'visa_center_monitor'),
    ).toEqual(['pending'])
  })

  it('lists pending targets for admin/agent', (): void => {
    expect(listLegalApplicationStatusTargets('pending', 'admin')).toEqual([
      'rejected',
      'booked',
    ])
    expect(listLegalApplicationStatusTargets('pending', 'agent')).toEqual([
      'rejected',
      'booked',
    ])
  })

  it('lists booked and rejected return paths', (): void => {
    expect(listLegalApplicationStatusTargets('booked', 'superadmin')).toEqual([
      'issued',
      'pending',
    ])
    expect(listLegalApplicationStatusTargets('rejected', 'agent')).toEqual([
      'pending',
    ])
  })

  it('offers no targets from issued', (): void => {
    expect(listLegalApplicationStatusTargets('issued', 'admin')).toEqual([])
  })
})
