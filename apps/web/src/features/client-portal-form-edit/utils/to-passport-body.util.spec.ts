import { describe, expect, it } from 'vitest'
import {
  PORTAL_FORM_ALL_FIELD_KEYS,
  PORTAL_FORM_PASSPORT_FIELD_KEYS,
} from '../constants'
import type { ClientPortalFormValues } from '../types'
import { toPassportBody } from './to-passport-body.util'

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

describe('toPassportBody', (): void => {
  it('maps only FR-6 passport keys and trims values', (): void => {
    const values = emptyFormValues()
    values.firstName = '  Ada  '
    values.lastName = ' Lovelace '
    values.passportNumber = ' AB123 '
    values.phone = '+201000000000'
    values.purpose = 'Tourism'
    values.submitCity = 'Cairo'

    const body = toPassportBody(values)

    expect(body).toEqual({
      firstName: 'Ada',
      lastName: 'Lovelace',
      lastNameAtBirth: '',
      otherNames: '',
      dob: '',
      placeOfBirth: '',
      countryOfBirth: '',
      nationality: '',
      nationalityAtBirth: '',
      nationalId: '',
      gender: '',
      maritalStatus: '',
      passportType: '',
      passportNumber: 'AB123',
      passportIssued: '',
      passportExpires: '',
      passportIssuedBy: '',
      passportIssueCountry: '',
    })
    expect(Object.keys(body).sort()).toEqual(
      [...PORTAL_FORM_PASSPORT_FIELD_KEYS].sort(),
    )
    expect(body).not.toHaveProperty('phone')
    expect(body).not.toHaveProperty('purpose')
    expect(body).not.toHaveProperty('submitCity')
  })
})
