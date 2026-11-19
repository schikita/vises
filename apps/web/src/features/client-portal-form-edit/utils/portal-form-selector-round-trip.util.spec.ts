import { describe, expect, it } from 'vitest'
import type { Application } from '@/entities/application'
import type { ClientDetailWithPortalForm } from '@/entities/client'
import { PORTAL_FORM_ALL_FIELD_KEYS } from '../constants'
import type { ClientPortalFormValues } from '../types'
import { toPortalFormBody } from './to-portal-form-body.util'
import { toPortalFormValues } from './to-portal-form-values.util'
import { toTripUpsertPatch } from './to-trip-upsert-patch.util'

const emptyDetail = (): ClientDetailWithPortalForm => ({
  id: 'cli-1',
  agentId: 'agent-1',
  firstName: null,
  lastName: null,
  lastNameAtBirth: null,
  dob: null,
  placeOfBirth: null,
  countryOfBirth: null,
  nationality: null,
  nationalityAtBirth: null,
  nationalId: null,
  otherNames: null,
  gender: null,
  maritalStatus: null,
  passportNumber: null,
  passportIssued: null,
  passportExpires: null,
  passportType: null,
  passportIssueCountry: null,
  passportIssuedBy: null,
  applicationId: 'app-1',
  applicationStatus: 'draft',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  address: null,
  phone: null,
  homeAddressLine2: null,
  homeCountry: null,
  homeCity: null,
  homePostalCode: null,
  employerName: null,
  employerPhone: null,
  employerAddress: null,
  occupation: null,
  purpose: null,
  firstEntry: null,
  entries: null,
  durationDays: null,
  previousFingerPrintStatus: null,
  previousFingerPrintDate: null,
  blsInvitingAuthority: null,
  invitingAuthorityName: null,
  invitingCountry: null,
  invitingCity: null,
  invitingZipCode: null,
  invitingAddress: null,
  invitingEmail: null,
  invitingContactNo: null,
  invitingFaxNo: null,
  invitingContactName: null,
  invitingContactSurname: null,
  invitingContactCountry: null,
  invitingContactCity: null,
  invitingContactZipCode: null,
  invitingContactAddress: null,
  invitingContactContactNo: null,
  invitingContactEmail: null,
  invitingContactFaxNo: null,
  costCoveredBy: null,
  meansOfSupport: null,
  memberStateSecondDestination: null,
  portalFormConditionals: null,
})

const applicationWithDestination = (destination: string): Application => ({
  id: 'app-1',
  code: 'A-1',
  clientEmail: 'a@example.com',
  portalFormEmail: null,
  status: 'draft',
  destination,
  visaType: 'Tourist',
  visaSubType: 'Short Stay',
  category: 'Normal',
  submitCountry: '',
  submitCity: 'Cairo',
  travelDate: '',
  returnDate: '',
  comment: '',
  applicants: [],
  documents: [],
  paymentAmount: 0,
  paymentPaid: false,
  paymentNote: '',
  visitDate: '',
  visitTime: '',
  visitPlace: '',
  manager: '',
  timeline: [],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
})

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

describe('destination and previousVisaIssuedCountry round-trip', (): void => {
  it('hydrates both fields and writes them back through body and trip patch', (): void => {
    const detail = emptyDetail()
    detail.portalFormConditionals = {
      previousVisaIssuedCountry: 'Spain',
    }

    const values = toPortalFormValues(
      detail,
      applicationWithDestination('  France  '),
    )

    expect(values.destination).toBe('  France  ')
    expect(values.previousVisaIssuedCountry).toBe('Spain')

    const body = toPortalFormBody(values)
    expect(body.portalFormConditionals?.previousVisaIssuedCountry).toBe('Spain')
    expect(body).not.toHaveProperty('destination')

    const patch = toTripUpsertPatch(values)
    expect(patch.destination).toBe('France')
    expect(patch.submitCity).toBe('Cairo')
  })

  it('stores an empty previous visa country as null and an empty destination as an empty trip value', (): void => {
    const values = emptyFormValues()
    const hydrated = toPortalFormValues(emptyDetail(), applicationWithDestination(''))

    expect(hydrated.destination).toBe('')
    expect(hydrated.previousVisaIssuedCountry).toBe('')
    expect(toPortalFormBody(values).portalFormConditionals?.previousVisaIssuedCountry).toBe(
      null,
    )
    expect(toTripUpsertPatch(values).destination).toBe('')
  })
})
