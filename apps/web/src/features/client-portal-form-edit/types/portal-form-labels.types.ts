import { PORTAL_FORM_INVITING_AUTHORITY_OPTIONS } from '../constants/client-portal-form-inviting-authority.constants'
import { PORTAL_FORM_FINGERPRINT_STATUS_OPTIONS } from '../constants/portal-form-fingerprint-status.constants'
import type { PortalFormField } from './client-portal-form.types'

export type PortalFormSectionId =
  | 'personal'
  | 'minor'
  | 'passport'
  | 'home'
  | 'otherResidence'
  | 'employer'
  | 'travel'
  | 'previousVisa'
  | 'fingerprint'
  | 'entryPermit'
  | 'inviting'
  | 'invitingCompany'
  | 'invitingContact'
  | 'cost'
  | 'euFamilyCitizen'
  | 'euFamilyRelationship'
  | 'trip'

export type PortalFormFingerprintStatusLabelKey =
  (typeof PORTAL_FORM_FINGERPRINT_STATUS_OPTIONS)[number]['labelKey']

export type PortalFormInvitingAuthorityLabelKey =
  (typeof PORTAL_FORM_INVITING_AUTHORITY_OPTIONS)[number]['labelKey']

export type PortalFormLabels = {
  fieldLabel: (field: PortalFormField) => string
  sectionLabel: (section: PortalFormSectionId) => string
  fingerprintStatusLabel: (
    labelKey: PortalFormFingerprintStatusLabelKey,
  ) => string
  invitingAuthorityLabel: (
    labelKey: PortalFormInvitingAuthorityLabelKey,
  ) => string
  issueMessage: (message: string | undefined) => string | undefined
}
