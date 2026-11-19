import { describe, expect, it } from 'vitest'
import {
  PORTAL_FORM_ALL_FIELD_KEYS,
  PORTAL_FORM_TRIP_FIELD_KEYS,
} from '../constants'
import type { ClientPortalFormValues } from '../types'
import { toTripUpsertPatch } from './to-trip-upsert-patch.util'

const emptyFormValues = (): ClientPortalFormValues => {
  const values = {} as ClientPortalFormValues
  for (const key of PORTAL_FORM_ALL_FIELD_KEYS) {
    if (key === 'blsInvitingAuthority') {
      values.blsInvitingAuthority = ''
      continue
    }
    values[key] = ''
  }
  return values
}

describe('toTripUpsertPatch', (): void => {
  it('maps only trip keys and trims values', (): void => {
    const values = emptyFormValues()
    values.submitCity = '  Cairo  '
    values.visaType = ' Tourist '
    values.visaSubType = ' Short Stay '
    values.category = ' Normal '
    values.firstName = 'Ada'
    values.phone = '+201000000000'

    const patch = toTripUpsertPatch(values)

    expect(patch).toEqual({
      submitCity: 'Cairo',
      visaType: 'Tourist',
      visaSubType: 'Short Stay',
      category: 'Normal',
      destination: '',
    })
    expect(Object.keys(patch).sort()).toEqual(
      [...PORTAL_FORM_TRIP_FIELD_KEYS].sort(),
    )
    expect(patch).not.toHaveProperty('firstName')
    expect(patch).not.toHaveProperty('phone')
  })
})
