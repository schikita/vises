import type { PortalFormSelectOption } from '../types/portal-form-select-option.types'
import type { PortalFormSelectField } from '../types/portal-form-widget-field.types'
import { BLS_COST_COVERED_OPTIONS } from './bls-cost-covered-options.constants'
import { BLS_COUNTRY_OPTIONS } from './bls-country-options.constants'
import { BLS_FAMILY_RELATION_OPTIONS } from './bls-family-relation-options.constants'
import { BLS_GENDER_OPTIONS } from './bls-gender-options.constants'
import { BLS_JOURNEY_PURPOSE_OPTIONS } from './bls-journey-purpose-options.constants'
import { BLS_MARITAL_STATUS_OPTIONS } from './bls-marital-status-options.constants'
import { BLS_MEANS_OF_SUPPORT_OPTIONS } from './bls-means-of-support-options.constants'
import { BLS_NATIONALITY_COUNTRY_OPTIONS } from './bls-nationality-country-options.constants'
import { BLS_NUMBER_OF_ENTRIES_OPTIONS } from './bls-number-of-entries-options.constants'
import { BLS_OCCUPATION_OPTIONS } from './bls-occupation-options.constants'
import { BLS_PASSPORT_TYPE_OPTIONS } from './bls-passport-type-options.constants'
import { BLS_SCHENGEN_COUNTRY_OPTIONS } from './bls-schengen-country-options.constants'

/** Field key → trimmed site option list. No functions. */
export const PORTAL_FORM_SELECT_FIELD_OPTIONS: Record<
  PortalFormSelectField,
  readonly PortalFormSelectOption[]
> = {
  countryOfBirth: BLS_NATIONALITY_COUNTRY_OPTIONS,
  nationality: BLS_NATIONALITY_COUNTRY_OPTIONS,
  nationalityAtBirth: BLS_NATIONALITY_COUNTRY_OPTIONS,
  gender: BLS_GENDER_OPTIONS,
  maritalStatus: BLS_MARITAL_STATUS_OPTIONS,
  minorParentNationality: BLS_COUNTRY_OPTIONS,
  passportType: BLS_PASSPORT_TYPE_OPTIONS,
  passportIssueCountry: BLS_NATIONALITY_COUNTRY_OPTIONS,
  homeCountry: BLS_NATIONALITY_COUNTRY_OPTIONS,
  occupation: BLS_OCCUPATION_OPTIONS,
  purpose: BLS_JOURNEY_PURPOSE_OPTIONS,
  destination: BLS_SCHENGEN_COUNTRY_OPTIONS,
  memberStateSecondDestination: BLS_SCHENGEN_COUNTRY_OPTIONS,
  firstEntry: BLS_SCHENGEN_COUNTRY_OPTIONS,
  entries: BLS_NUMBER_OF_ENTRIES_OPTIONS,
  previousVisaIssuedCountry: BLS_NATIONALITY_COUNTRY_OPTIONS,
  finalDestinationIssuedByCountry: BLS_NATIONALITY_COUNTRY_OPTIONS,
  invitingCountry: BLS_NATIONALITY_COUNTRY_OPTIONS,
  invitingContactCountry: BLS_NATIONALITY_COUNTRY_OPTIONS,
  costCoveredBy: BLS_COST_COVERED_OPTIONS,
  meansOfSupport: BLS_MEANS_OF_SUPPORT_OPTIONS,
  otherCitizenNationality: BLS_NATIONALITY_COUNTRY_OPTIONS,
  otherCitizenFamilyRelationship: BLS_FAMILY_RELATION_OPTIONS,
}
