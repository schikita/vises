import type { ClientPassportUpdateDto } from '@vises/contracts'
import { PORTAL_FORM_PASSPORT_FIELD_KEYS } from '../constants'
import type { ClientPortalFormValues } from '../types'

/** Build PATCH …/passport body from form values (FR-6 only). */
export const toPassportBody = (
  values: ClientPortalFormValues,
): ClientPassportUpdateDto => {
  const body: ClientPassportUpdateDto = {}
  for (const key of PORTAL_FORM_PASSPORT_FIELD_KEYS) {
    body[key] = values[key].trim()
  }
  return body
}
