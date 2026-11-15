import type { Application } from '@/entities/application'
import type { ClientDetailWithPortalForm } from '@/entities/client'
import {
  PORTAL_FORM_CONDITIONAL_FLAG_FIELD_KEYS,
  PORTAL_FORM_CONDITIONAL_STRING_FIELD_KEYS,
  PORTAL_FORM_PASSPORT_FIELD_KEYS,
  PORTAL_FORM_STRING_FIELD_KEYS,
  PORTAL_FORM_TRIP_FIELD_KEYS,
} from '../constants'
import type { ClientPortalFormValues } from '../types'
import { conditionalFlagToFormString } from './conditional-flag-to-form-string.util'
import { nullishToFormString } from './nullish-to-form-string.util'
import { toInvitingAuthorityFormValue } from './to-inviting-authority-form-value.util'

/**
 * Hydrate form values from GET client detail (+ optional application trip fields).
 */
export const toPortalFormValues = (
  detail: ClientDetailWithPortalForm,
  application?: Application | null,
): ClientPortalFormValues => {
  const values = {} as ClientPortalFormValues

  for (const key of PORTAL_FORM_PASSPORT_FIELD_KEYS) {
    values[key] = nullishToFormString(detail[key])
  }

  for (const key of PORTAL_FORM_STRING_FIELD_KEYS) {
    if (key === 'blsInvitingAuthority') {
      values.blsInvitingAuthority = toInvitingAuthorityFormValue(
        nullishToFormString(detail.blsInvitingAuthority),
      )
      continue
    }
    values[key] = nullishToFormString(detail[key])
  }

  const conditionals = detail.portalFormConditionals
  for (const key of PORTAL_FORM_CONDITIONAL_FLAG_FIELD_KEYS) {
    values[key] = conditionalFlagToFormString(conditionals?.[key])
  }
  for (const key of PORTAL_FORM_CONDITIONAL_STRING_FIELD_KEYS) {
    values[key] = nullishToFormString(conditionals?.[key] ?? null)
  }

  for (const key of PORTAL_FORM_TRIP_FIELD_KEYS) {
    if (!application) {
      values[key] = ''
      continue
    }
    const tripValue = application[key]
    values[key] = nullishToFormString(
      tripValue === undefined || tripValue === null ? null : String(tripValue),
    )
  }

  return values
}
