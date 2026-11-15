import type { PortalOnePageFormValues } from '../types/portal-one-page-form.types'

/** Empty conditionals bag — flags unset; no invented branch values (AC-14 / DEC-PF-007). */
export const createEmptyPortalFormConditionals = (): PortalOnePageFormValues['portalFormConditionals'] => ({
  isMinor: null,
  minorParentSurname: '',
  minorParentFirstName: '',
  minorParentLastName: '',
  minorParentNationality: '',
  minorParentAddress: '',
  hasOtherResidenceship: null,
  otherResidenceshipPermitValidUntil: '',
  isVisaIssuedBefore: null,
  previousVisaValidFrom: '',
  previousVisaValidTo: '',
  finalDestinationIssuedByCountry: '',
  finalDestinationValidFromDate: '',
  finalDestinationValidToDate: '',
  otherCitizenSurname: '',
  otherCitizenFirstName: '',
  otherCitizenDateOfBirth: '',
  otherCitizenNationality: '',
  otherCitizenDocumentNumber: '',
  otherCitizenFamilyRelationship: '',
})
