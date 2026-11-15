import type { ClientPassportUpdateDto } from '@vises/contracts'
import type { PortalOnePageFormValues } from '../types/portal-one-page-form.types'
import { omitBlankStringFields } from './omit-blank-string-fields.util'

/** Portal one-page identity/passport fields → ClientPassportUpdateDto (FR-6). */
export const mapPortalFormValuesToPassportUpdate = (
  values: PortalOnePageFormValues,
): ClientPassportUpdateDto =>
  omitBlankStringFields({
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    lastNameAtBirth: values.lastNameAtBirth.trim(),
    dob: values.dob.trim(),
    placeOfBirth: values.placeOfBirth.trim(),
    countryOfBirth: values.countryOfBirth.trim(),
    nationality: values.nationality.trim(),
    nationalityAtBirth: values.nationalityAtBirth?.trim() ?? '',
    nationalId: values.nationalId?.trim() ?? '',
    otherNames: values.otherNames?.trim() ?? '',
    gender: values.gender,
    maritalStatus: values.maritalStatus.trim(),
    passportNumber: values.passportNumber.trim(),
    passportIssued: values.passportIssued.trim(),
    passportExpires: values.passportExpires.trim(),
    passportType: values.passportType,
    passportIssueCountry: values.passportIssueCountry,
    passportIssuedBy: values.passportIssuedBy.trim(),
  })
