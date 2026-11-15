import type { Application } from '@/entities/application'
import type { ClientDetailWithPortalForm } from '@/entities/client'
import type { PortalOnePageFormValues } from '../types/portal-one-page-form.types'
import { createEmptyPortalFormConditionals } from './create-empty-portal-form-conditionals.util'
import { nullToEmptyString } from './null-to-empty-string.util'

/**
 * Load mapper: Client detail (portal-form + FR-6) + Application → form defaults.
 * Null → empty string. Does not use applicants[] as SoT (DEC-PF-002).
 */
export const mapClientDetailAndApplicationToPortalFormValues = (
  client: ClientDetailWithPortalForm,
  application: Application,
): PortalOnePageFormValues => {
  const travelDate = nullToEmptyString(application.travelDate)
  const conditionals = client.portalFormConditionals
  const emptyConditionals = createEmptyPortalFormConditionals()

  return {
    firstName: nullToEmptyString(client.firstName),
    lastName: nullToEmptyString(client.lastName),
    lastNameAtBirth: nullToEmptyString(client.lastNameAtBirth),
    dob: nullToEmptyString(client.dob),
    placeOfBirth: nullToEmptyString(client.placeOfBirth),
    countryOfBirth: nullToEmptyString(client.countryOfBirth),
    nationality: nullToEmptyString(client.nationality),
    gender: (nullToEmptyString(client.gender) || '') as PortalOnePageFormValues['gender'],
    maritalStatus: nullToEmptyString(client.maritalStatus),
    otherNames: nullToEmptyString(client.otherNames),
    nationalityAtBirth: nullToEmptyString(client.nationalityAtBirth),
    nationalId: nullToEmptyString(client.nationalId),
    passportNumber: nullToEmptyString(client.passportNumber),
    passportIssued: nullToEmptyString(client.passportIssued),
    passportExpires: nullToEmptyString(client.passportExpires),
    passportType: (nullToEmptyString(client.passportType) ||
      '') as PortalOnePageFormValues['passportType'],
    passportIssueCountry: (nullToEmptyString(client.passportIssueCountry) ||
      '') as PortalOnePageFormValues['passportIssueCountry'],
    passportIssuedBy: nullToEmptyString(client.passportIssuedBy),
    address: nullToEmptyString(client.address),
    homeAddressLine2: nullToEmptyString(client.homeAddressLine2),
    homeCountry: nullToEmptyString(client.homeCountry),
    homeCity: nullToEmptyString(client.homeCity),
    homePostalCode: nullToEmptyString(client.homePostalCode),
    phone: nullToEmptyString(client.phone),
    employerName: nullToEmptyString(client.employerName),
    employerPhone: nullToEmptyString(client.employerPhone),
    employerAddress: nullToEmptyString(client.employerAddress),
    occupation: nullToEmptyString(client.occupation),
    purpose: nullToEmptyString(client.purpose),
    destination: nullToEmptyString(application.destination),
    firstEntry: nullToEmptyString(client.firstEntry),
    entries: nullToEmptyString(client.entries),
    durationDays: nullToEmptyString(client.durationDays),
    travelDate,
    intendedArrivalDate: travelDate,
    returnDate: nullToEmptyString(application.returnDate),
    memberStateSecondDestination: nullToEmptyString(
      client.memberStateSecondDestination,
    ),
    submitCountry: nullToEmptyString(application.submitCountry),
    submitCity: nullToEmptyString(application.submitCity),
    visaType: nullToEmptyString(application.visaType),
    visaSubType: nullToEmptyString(application.visaSubType),
    category: nullToEmptyString(application.category),
    blsInvitingAuthority: (nullToEmptyString(client.blsInvitingAuthority) ||
      '') as PortalOnePageFormValues['blsInvitingAuthority'],
    invitingAuthorityName: nullToEmptyString(client.invitingAuthorityName),
    invitingCountry: nullToEmptyString(client.invitingCountry),
    invitingCity: nullToEmptyString(client.invitingCity),
    invitingZipCode: nullToEmptyString(client.invitingZipCode),
    invitingAddress: nullToEmptyString(client.invitingAddress),
    invitingEmail: nullToEmptyString(client.invitingEmail),
    invitingContactNo: nullToEmptyString(client.invitingContactNo),
    invitingFaxNo: nullToEmptyString(client.invitingFaxNo),
    invitingContactName: nullToEmptyString(client.invitingContactName),
    invitingContactSurname: nullToEmptyString(client.invitingContactSurname),
    invitingContactCountry: nullToEmptyString(client.invitingContactCountry),
    invitingContactCity: nullToEmptyString(client.invitingContactCity),
    invitingContactZipCode: nullToEmptyString(client.invitingContactZipCode),
    invitingContactAddress: nullToEmptyString(client.invitingContactAddress),
    invitingContactContactNo: nullToEmptyString(client.invitingContactContactNo),
    invitingContactEmail: nullToEmptyString(client.invitingContactEmail),
    invitingContactFaxNo: nullToEmptyString(client.invitingContactFaxNo),
    costCoveredBy: nullToEmptyString(client.costCoveredBy),
    meansOfSupport: nullToEmptyString(client.meansOfSupport),
    previousFingerPrintStatus: nullToEmptyString(client.previousFingerPrintStatus),
    previousFingerPrintDate: nullToEmptyString(client.previousFingerPrintDate),
    portalFormConditionals: {
      ...emptyConditionals,
      ...(conditionals
        ? {
            isMinor: conditionals.isMinor ?? null,
            minorParentSurname: nullToEmptyString(conditionals.minorParentSurname),
            minorParentFirstName: nullToEmptyString(
              conditionals.minorParentFirstName,
            ),
            minorParentLastName: nullToEmptyString(conditionals.minorParentLastName),
            minorParentNationality: nullToEmptyString(
              conditionals.minorParentNationality,
            ),
            minorParentAddress: nullToEmptyString(conditionals.minorParentAddress),
            hasOtherResidenceship: conditionals.hasOtherResidenceship ?? null,
            otherResidenceshipPermitValidUntil: nullToEmptyString(
              conditionals.otherResidenceshipPermitValidUntil,
            ),
            isVisaIssuedBefore: conditionals.isVisaIssuedBefore ?? null,
            previousVisaValidFrom: nullToEmptyString(
              conditionals.previousVisaValidFrom,
            ),
            previousVisaValidTo: nullToEmptyString(conditionals.previousVisaValidTo),
            finalDestinationIssuedByCountry: nullToEmptyString(
              conditionals.finalDestinationIssuedByCountry,
            ),
            finalDestinationValidFromDate: nullToEmptyString(
              conditionals.finalDestinationValidFromDate,
            ),
            finalDestinationValidToDate: nullToEmptyString(
              conditionals.finalDestinationValidToDate,
            ),
            otherCitizenSurname: nullToEmptyString(conditionals.otherCitizenSurname),
            otherCitizenFirstName: nullToEmptyString(
              conditionals.otherCitizenFirstName,
            ),
            otherCitizenDateOfBirth: nullToEmptyString(
              conditionals.otherCitizenDateOfBirth,
            ),
            otherCitizenNationality: nullToEmptyString(
              conditionals.otherCitizenNationality,
            ),
            otherCitizenDocumentNumber: nullToEmptyString(
              conditionals.otherCitizenDocumentNumber,
            ),
            otherCitizenFamilyRelationship: nullToEmptyString(
              conditionals.otherCitizenFamilyRelationship,
            ),
          }
        : {}),
    },
    clientEmail: nullToEmptyString(application.clientEmail),
  }
}
