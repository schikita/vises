import type { ClientDetailDto } from '@vises/contracts'
import { CLIENT_PASSPORT_FORM_FIELDS } from '../constants'
import type { ClientPassportFormValues } from '../types'

/** Map Decision 2A detail plaintext into in-memory form values (no durable storage). */
export const toPassportFormValues = (
  detail: ClientDetailDto,
): ClientPassportFormValues => {
  const values = {} as ClientPassportFormValues
  for (const key of CLIENT_PASSPORT_FORM_FIELDS) {
    values[key] = detail[key] ?? ''
  }
  return values
}
