import type { ClientCreateDto } from '@vises/contracts'
import type { ClientCreateFormValues } from '../types'

/** Omit blank optional fields from create body. */
export const toClientCreateBody = (
  values: ClientCreateFormValues,
): ClientCreateDto => {
  const body: ClientCreateDto = {}
  const email = values.email.trim()
  const phone = values.phone.trim()
  const address = values.address.trim()
  const purpose = values.purpose.trim()
  if (email) {
    body.email = email
  }
  if (phone) {
    body.phone = phone
  }
  if (address) {
    body.address = address
  }
  if (purpose) {
    body.purpose = purpose
  }
  return body
}
