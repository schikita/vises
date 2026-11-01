import type { ClientPassportUpdateDto } from '@vises/contracts'
import { CLIENT_PASSPORT_FORM_FIELDS } from '../constants'
import type { ClientPassportFormValues } from '../types'

/** Build PATCH body from form values (trimmed strings, including empties). */
export const toPassportUpdateBody = (
  values: ClientPassportFormValues,
): ClientPassportUpdateDto => {
  const body: ClientPassportUpdateDto = {}
  for (const key of CLIENT_PASSPORT_FORM_FIELDS) {
    body[key] = values[key].trim()
  }
  return body
}
