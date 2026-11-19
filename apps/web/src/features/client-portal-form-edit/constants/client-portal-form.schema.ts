import { z } from 'zod'
import { PORTAL_FORM_HAPPY_PATH_REQUIRED_FIELD_KEYS } from './client-portal-form-happy-path-required-keys.constants'
import { PORTAL_FORM_INVITING_AUTHORITY_VALUE } from './client-portal-form-inviting-authority.constants'
import { PORTAL_FORM_REQUIRED_MESSAGE } from './portal-form-required-message.constants'

const invitingAuthoritySchema = z.union([
  z.literal(''),
  z.literal(PORTAL_FORM_INVITING_AUTHORITY_VALUE.COMPANY),
  z.literal(PORTAL_FORM_INVITING_AUTHORITY_VALUE.HOTEL),
  z.literal(PORTAL_FORM_INVITING_AUTHORITY_VALUE.PERSON),
])

/**
 * Full portal-form page schema: passport + portal strings + conditionals + trip.
 * Happy-path completeness keys are required (non-empty after trim); optional /
 * conditional / trip keys do not block save (REQ-FE-013 / CON-FE-005).
 */
export const clientPortalFormSchema = z
  .object({
    firstName: z.string(),
    lastName: z.string(),
    lastNameAtBirth: z.string(),
    otherNames: z.string(),
    dob: z.string(),
    placeOfBirth: z.string(),
    countryOfBirth: z.string(),
    nationality: z.string(),
    nationalityAtBirth: z.string(),
    nationalId: z.string(),
    gender: z.string(),
    maritalStatus: z.string(),
    passportType: z.string(),
    passportNumber: z.string(),
    passportIssued: z.string(),
    passportExpires: z.string(),
    passportIssuedBy: z.string(),
    passportIssueCountry: z.string(),
    address: z.string(),
    phone: z.string(),
    homeAddressLine2: z.string(),
    homeCountry: z.string(),
    homeCity: z.string(),
    homePostalCode: z.string(),
    employerName: z.string(),
    employerPhone: z.string(),
    employerAddress: z.string(),
    occupation: z.string(),
    purpose: z.string(),
    firstEntry: z.string(),
    entries: z.string(),
    durationDays: z.string(),
    previousFingerPrintStatus: z.string(),
    previousFingerPrintDate: z.string(),
    blsInvitingAuthority: invitingAuthoritySchema,
    invitingAuthorityName: z.string(),
    invitingCountry: z.string(),
    invitingCity: z.string(),
    invitingZipCode: z.string(),
    invitingAddress: z.string(),
    invitingEmail: z.string(),
    invitingContactNo: z.string(),
    invitingFaxNo: z.string(),
    invitingContactName: z.string(),
    invitingContactSurname: z.string(),
    invitingContactCountry: z.string(),
    invitingContactCity: z.string(),
    invitingContactZipCode: z.string(),
    invitingContactAddress: z.string(),
    invitingContactContactNo: z.string(),
    invitingContactEmail: z.string(),
    invitingContactFaxNo: z.string(),
    costCoveredBy: z.string(),
    meansOfSupport: z.string(),
    memberStateSecondDestination: z.string(),
    isMinor: z.string(),
    minorParentSurname: z.string(),
    minorParentFirstName: z.string(),
    minorParentLastName: z.string(),
    minorParentNationality: z.string(),
    minorParentAddress: z.string(),
    hasOtherResidenceship: z.string(),
    otherResidenceshipPermitValidUntil: z.string(),
    isVisaIssuedBefore: z.string(),
    previousVisaValidFrom: z.string(),
    previousVisaValidTo: z.string(),
    previousVisaIssuedCountry: z.string(),
    finalDestinationIssuedByCountry: z.string(),
    finalDestinationValidFromDate: z.string(),
    finalDestinationValidToDate: z.string(),
    otherCitizenSurname: z.string(),
    otherCitizenFirstName: z.string(),
    otherCitizenDateOfBirth: z.string(),
    otherCitizenNationality: z.string(),
    otherCitizenDocumentNumber: z.string(),
    otherCitizenFamilyRelationship: z.string(),
    submitCity: z.string(),
    visaType: z.string(),
    visaSubType: z.string(),
    category: z.string(),
    destination: z.string(),
  })
  .superRefine((values, ctx): void => {
    for (const key of PORTAL_FORM_HAPPY_PATH_REQUIRED_FIELD_KEYS) {
      if (values[key].trim() === '') {
        ctx.addIssue({
          code: 'custom',
          path: [key],
          message: PORTAL_FORM_REQUIRED_MESSAGE,
        })
      }
    }
  })
