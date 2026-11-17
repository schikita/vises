import { describe, expect, it } from 'vitest'
import { listLegalApplicationStatusTargets } from './list-legal-application-status-targets.util'

describe('listLegalApplicationStatusTargets (FE10 / AC-9)', (): void => {
  it('lists draft staff targets from the BUSINESS matrix', (): void => {
    expect(listLegalApplicationStatusTargets('draft', 'admin')).toEqual([
      'filling',
      'not_ready_for_appointment',
      'declined',
    ])
    expect(listLegalApplicationStatusTargets('draft', 'superadmin')).toEqual([
      'filling',
      'not_ready_for_appointment',
      'declined',
    ])
    expect(listLegalApplicationStatusTargets('draft', 'agent')).toEqual([
      'filling',
      'not_ready_for_appointment',
      'declined',
    ])
  })

  it('offers draft → not_ready_for_appointment for visa_center_monitor', (): void => {
    expect(
      listLegalApplicationStatusTargets('draft', 'visa_center_monitor'),
    ).toEqual(['not_ready_for_appointment'])
  })

  it('lists not_ready_for_appointment targets for admin/agent', (): void => {
    expect(
      listLegalApplicationStatusTargets('not_ready_for_appointment', 'admin'),
    ).toEqual(['filling', 'ready_for_appointment', 'declined'])
    expect(
      listLegalApplicationStatusTargets('not_ready_for_appointment', 'agent'),
    ).toEqual(['filling', 'ready_for_appointment', 'declined'])
  })

  it('lists booked and declined return paths', (): void => {
    expect(listLegalApplicationStatusTargets('booked', 'superadmin')).toEqual([
      'ready_for_appointment',
      'declined',
    ])
    expect(listLegalApplicationStatusTargets('declined', 'agent')).toEqual([
      'not_ready_for_appointment',
    ])
  })

  it('offers no system-only targets from draft for system actor beyond matrix', (): void => {
    expect(listLegalApplicationStatusTargets('draft', 'system')).toEqual([
      'filling',
    ])
  })
})
