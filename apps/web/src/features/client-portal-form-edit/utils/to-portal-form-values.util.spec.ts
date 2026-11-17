import { describe, expect, it } from 'vitest'
import type { Application } from '@/entities/application'
import type { ClientDetailWithPortalForm } from '@/entities/client'
import {
  PORTAL_FORM_ALL_FIELD_KEYS,
  PORTAL_FORM_INVITING_AUTHORITY_VALUE,
} from '../constants'
import { toPortalFormValues } from './to-portal-form-values.util'

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

const tripApplication = (
  overrides: Pick<
    Application,
    'submitCity' | 'visaType' | 'visaSubType' | 'category'
  >,
): Application => ({
  id: 'app-1',
  code: 'A-1',
  clientEmail: 'a@example.com',
  portalFormEmail: null,
  status: 'draft',
  destination: '',
  visaType: overrides.visaType,
  visaSubType: overrides.visaSubType,
  category: overrides.category,
  submitCountry: '',
  submitCity: overrides.submitCity,
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

describe('toPortalFormValues', (): void => {
  it('hydrates null detail fields to empty strings and covers every form key', (): void => {
    const values = toPortalFormValues(emptyDetail())

    for (const key of PORTAL_FORM_ALL_FIELD_KEYS) {
      expect(values[key]).toBe('')
    }
  })

  it('maps passport, portal strings, conditionals, and trip fields from detail + application', (): void => {
    const detail = emptyDetail()
    detail.firstName = 'Ada'
    detail.passportNumber = 'AB123'
    detail.phone = '+201000000000'
    detail.purpose = 'Tourism'
    detail.firstEntry = 'FR'
    detail.entries = 'Multiple'
    detail.durationDays = '15'
    detail.blsInvitingAuthority = PORTAL_FORM_INVITING_AUTHORITY_VALUE.COMPANY
    detail.portalFormConditionals = {
      isMinor: true,
      hasOtherResidenceship: false,
      isVisaIssuedBefore: 'true',
      minorParentSurname: 'Lovelace',
      previousVisaValidFrom: '2020-01-01',
    }

    const values = toPortalFormValues(
      detail,
      tripApplication({
        submitCity: 'Cairo',
        visaType: 'Tourist',
        visaSubType: 'Short Stay',
        category: 'Normal',
      }),
    )

    expect(values.firstName).toBe('Ada')
    expect(values.passportNumber).toBe('AB123')
    expect(values.phone).toBe('+201000000000')
    expect(values.purpose).toBe('Tourism')
    expect(values.firstEntry).toBe('FR')
    expect(values.entries).toBe('Multiple')
    expect(values.durationDays).toBe('15')
    expect(values.blsInvitingAuthority).toBe(
      PORTAL_FORM_INVITING_AUTHORITY_VALUE.COMPANY,
    )
    expect(values.isMinor).toBe('true')
    expect(values.hasOtherResidenceship).toBe('false')
    expect(values.isVisaIssuedBefore).toBe('true')
    expect(values.minorParentSurname).toBe('Lovelace')
    expect(values.previousVisaValidFrom).toBe('2020-01-01')
    expect(values.submitCity).toBe('Cairo')
    expect(values.visaType).toBe('Tourist')
    expect(values.visaSubType).toBe('Short Stay')
    expect(values.category).toBe('Normal')
  })

  it('leaves trip fields empty when application is missing', (): void => {
    const values = toPortalFormValues(emptyDetail(), null)

    expect(values.submitCity).toBe('')
    expect(values.visaType).toBe('')
    expect(values.visaSubType).toBe('')
    expect(values.category).toBe('')
  })

  it('coerces unknown inviting authority to empty form value', (): void => {
    const detail = emptyDetail()
    detail.blsInvitingAuthority = 'not-a-portal-value'

    const values = toPortalFormValues(detail)

    expect(values.blsInvitingAuthority).toBe('')
  })
})
