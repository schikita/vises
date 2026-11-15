import {
  PORTAL_FORM_ALL_FIELD_KEYS,
  PORTAL_FORM_CONDITIONAL_FIELD_KEYS,
  PORTAL_FORM_HAPPY_PATH_REQUIRED_FIELD_KEYS,
  PORTAL_FORM_PASSPORT_FIELD_KEYS,
  PORTAL_FORM_STRING_FIELD_KEYS,
  PORTAL_FORM_TRIP_FIELD_KEYS,
} from '../constants'
import type { PortalFormInvitingAuthorityValue } from './client-portal-form-inviting-authority.types'

export type PortalFormField = (typeof PORTAL_FORM_ALL_FIELD_KEYS)[number]

export type PortalFormPassportField =
  (typeof PORTAL_FORM_PASSPORT_FIELD_KEYS)[number]

export type PortalFormStringField =
  (typeof PORTAL_FORM_STRING_FIELD_KEYS)[number]

export type PortalFormConditionalField =
  (typeof PORTAL_FORM_CONDITIONAL_FIELD_KEYS)[number]

export type PortalFormTripField = (typeof PORTAL_FORM_TRIP_FIELD_KEYS)[number]

export type PortalFormHappyPathRequiredField =
  (typeof PORTAL_FORM_HAPPY_PATH_REQUIRED_FIELD_KEYS)[number]

/**
 * In-memory react-hook-form values for the portal-form collection page.
 * `blsInvitingAuthority` matches the zod inviting-authority literals.
 */
export type ClientPortalFormValues = Omit<
  Record<PortalFormField, string>,
  'blsInvitingAuthority'
> & {
  blsInvitingAuthority: PortalFormInvitingAuthorityValue | ''
}

export type PortalFormTripUpsertPatch = Record<PortalFormTripField, string>
