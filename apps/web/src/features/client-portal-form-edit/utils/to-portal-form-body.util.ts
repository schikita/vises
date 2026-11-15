import type {
  ClientPortalFormConditionals,
  ClientPortalFormUpdateDto,
} from '@vises/contracts'
import {
  PORTAL_FORM_CONDITIONAL_FLAG_FIELD_KEYS,
  PORTAL_FORM_CONDITIONAL_STRING_FIELD_KEYS,
  PORTAL_FORM_STRING_FIELD_KEYS,
} from '../constants'
import type { ClientPortalFormValues } from '../types'
import { formStringToConditionalFlag } from './form-string-to-conditional-flag.util'

/** Build PATCH …/portal-form body (no FR-6 passport keys). */
export const toPortalFormBody = (
  values: ClientPortalFormValues,
): ClientPortalFormUpdateDto => {
  const body: ClientPortalFormUpdateDto = {}

  for (const key of PORTAL_FORM_STRING_FIELD_KEYS) {
    body[key] = values[key].trim()
  }

  const conditionals: ClientPortalFormConditionals = {}
  for (const key of PORTAL_FORM_CONDITIONAL_FLAG_FIELD_KEYS) {
    conditionals[key] = formStringToConditionalFlag(values[key])
  }
  for (const key of PORTAL_FORM_CONDITIONAL_STRING_FIELD_KEYS) {
    const trimmed = values[key].trim()
    conditionals[key] = trimmed === '' ? null : trimmed
  }
  body.portalFormConditionals = conditionals

  return body
}
