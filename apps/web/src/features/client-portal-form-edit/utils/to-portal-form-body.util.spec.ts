import { describe, expect, it } from 'vitest'
import {
  PORTAL_FORM_ALL_FIELD_KEYS,
  PORTAL_FORM_INVITING_AUTHORITY_VALUE,
  PORTAL_FORM_PASSPORT_FIELD_KEYS,
  PORTAL_FORM_TRIP_FIELD_KEYS,
} from '../constants'
import type { ClientPortalFormValues } from '../types'
import { toPortalFormBody } from './to-portal-form-body.util'

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

describe('toPortalFormBody', (): void => {
  it('maps portal string fields and conditionals; trims whitespace', (): void => {
    const values = emptyFormValues()
    values.phone = '  +201000000000  '
    values.purpose = ' Tourism '
    values.firstEntry = 'FR'
    values.entries = 'Multiple'
    values.durationDays = '15'
    values.address = ' Street 1 '
    values.blsInvitingAuthority = PORTAL_FORM_INVITING_AUTHORITY_VALUE.COMPANY
    values.isMinor = 'true'
    values.hasOtherResidenceship = 'false'
    values.isVisaIssuedBefore = ''
    values.minorParentSurname = '  Lovelace  '
    values.previousVisaValidFrom = '   '

    const body = toPortalFormBody(values)

    expect(body.phone).toBe('+201000000000')
    expect(body.purpose).toBe('Tourism')
    expect(body.firstEntry).toBe('FR')
    expect(body.entries).toBe('Multiple')
    expect(body.durationDays).toBe('15')
    expect(body.address).toBe('Street 1')
    expect(body.blsInvitingAuthority).toBe(
      PORTAL_FORM_INVITING_AUTHORITY_VALUE.COMPANY,
    )
    expect(body.portalFormConditionals).toEqual({
      isMinor: true,
      hasOtherResidenceship: false,
      isVisaIssuedBefore: null,
      minorParentSurname: 'Lovelace',
      minorParentFirstName: null,
      minorParentLastName: null,
      minorParentNationality: null,
      minorParentAddress: null,
      otherResidenceshipPermitValidUntil: null,
      previousVisaValidFrom: null,
      previousVisaValidTo: null,
      finalDestinationIssuedByCountry: null,
      finalDestinationValidFromDate: null,
      finalDestinationValidToDate: null,
      otherCitizenSurname: null,
      otherCitizenFirstName: null,
      otherCitizenDateOfBirth: null,
      otherCitizenNationality: null,
      otherCitizenDocumentNumber: null,
      otherCitizenFamilyRelationship: null,
    })
  })

  it('does not include FR-6 passport or trip keys on the portal-form body', (): void => {
    const values = emptyFormValues()
    values.firstName = 'Ada'
    values.passportNumber = 'AB123'
    values.submitCity = 'Cairo'
    values.visaType = 'Tourist'
    values.visaSubType = 'Short Stay'
    values.category = 'Normal'

    const body = toPortalFormBody(values)

    for (const key of PORTAL_FORM_PASSPORT_FIELD_KEYS) {
      expect(body).not.toHaveProperty(key)
    }
    for (const key of PORTAL_FORM_TRIP_FIELD_KEYS) {
      expect(body).not.toHaveProperty(key)
    }
  })
})
