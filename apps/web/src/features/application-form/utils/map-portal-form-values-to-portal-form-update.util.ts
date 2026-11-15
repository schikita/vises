import type {
  ClientPortalFormConditionals,
  ClientPortalFormUpdateDto,
} from '@vises/contracts'
import type { PortalOnePageFormValues } from '../types/portal-one-page-form.types'
import { omitBlankStringFields } from './omit-blank-string-fields.util'

const mapConditionals = (
  bag: PortalOnePageFormValues['portalFormConditionals'],
): ClientPortalFormConditionals | undefined => {
  if (!bag) return undefined
  const cleaned = omitBlankStringFields({
    isMinor: bag.isMinor ?? null,
    minorParentSurname: bag.minorParentSurname ?? '',
    minorParentFirstName: bag.minorParentFirstName ?? '',
    minorParentLastName: bag.minorParentLastName ?? '',
    minorParentNationality: bag.minorParentNationality ?? '',
    minorParentAddress: bag.minorParentAddress ?? '',
    hasOtherResidenceship: bag.hasOtherResidenceship ?? null,
    otherResidenceshipPermitValidUntil:
      bag.otherResidenceshipPermitValidUntil ?? '',
    isVisaIssuedBefore: bag.isVisaIssuedBefore ?? null,
    previousVisaValidFrom: bag.previousVisaValidFrom ?? '',
    previousVisaValidTo: bag.previousVisaValidTo ?? '',
    finalDestinationIssuedByCountry: bag.finalDestinationIssuedByCountry ?? '',
    finalDestinationValidFromDate: bag.finalDestinationValidFromDate ?? '',
    finalDestinationValidToDate: bag.finalDestinationValidToDate ?? '',
    otherCitizenSurname: bag.otherCitizenSurname ?? '',
    otherCitizenFirstName: bag.otherCitizenFirstName ?? '',
    otherCitizenDateOfBirth: bag.otherCitizenDateOfBirth ?? '',
    otherCitizenNationality: bag.otherCitizenNationality ?? '',
    otherCitizenDocumentNumber: bag.otherCitizenDocumentNumber ?? '',
    otherCitizenFamilyRelationship: bag.otherCitizenFamilyRelationship ?? '',
  }) as ClientPortalFormConditionals
  return Object.keys(cleaned).length > 0 ? cleaned : undefined
}

/**
 * Portal one-page home/employer/inviting/cost/fingerprint/journey →
 * ClientPortalFormUpdateDto. Omits blank optional strings (no invented values).
 */
export const mapPortalFormValuesToPortalFormUpdate = (
  values: PortalOnePageFormValues,
): ClientPortalFormUpdateDto => {
  const conditionals = mapConditionals(values.portalFormConditionals)
  return omitBlankStringFields({
    address: values.address.trim(),
    homeAddressLine2: values.homeAddressLine2?.trim() ?? '',
    homeCountry: values.homeCountry.trim(),
    homeCity: values.homeCity.trim(),
    homePostalCode: values.homePostalCode.trim(),
    phone: values.phone.trim(),
    employerName: values.employerName.trim(),
    employerPhone: values.employerPhone.trim(),
    employerAddress: values.employerAddress.trim(),
    occupation: values.occupation.trim(),
    purpose: values.purpose.trim(),
    firstEntry: values.firstEntry.trim(),
    entries: values.entries.trim(),
    durationDays: values.durationDays.trim(),
    memberStateSecondDestination:
      values.memberStateSecondDestination?.trim() ?? '',
    blsInvitingAuthority: values.blsInvitingAuthority,
    invitingAuthorityName: values.invitingAuthorityName.trim(),
    invitingCountry: values.invitingCountry.trim(),
    invitingCity: values.invitingCity.trim(),
    invitingZipCode: values.invitingZipCode.trim(),
    invitingAddress: values.invitingAddress.trim(),
    invitingEmail: values.invitingEmail.trim(),
    invitingContactNo: values.invitingContactNo.trim(),
    invitingFaxNo: values.invitingFaxNo?.trim() ?? '',
    invitingContactName: values.invitingContactName.trim(),
    invitingContactSurname: values.invitingContactSurname.trim(),
    invitingContactCountry: values.invitingContactCountry.trim(),
    invitingContactCity: values.invitingContactCity.trim(),
    invitingContactZipCode: values.invitingContactZipCode.trim(),
    invitingContactAddress: values.invitingContactAddress.trim(),
    invitingContactContactNo: values.invitingContactContactNo.trim(),
    invitingContactEmail: values.invitingContactEmail.trim(),
    invitingContactFaxNo: values.invitingContactFaxNo?.trim() ?? '',
    costCoveredBy: values.costCoveredBy.trim(),
    meansOfSupport: values.meansOfSupport.trim(),
    previousFingerPrintStatus: values.previousFingerPrintStatus.trim(),
    previousFingerPrintDate: values.previousFingerPrintDate.trim(),
    ...(conditionals ? { portalFormConditionals: conditionals } : {}),
  })
}
