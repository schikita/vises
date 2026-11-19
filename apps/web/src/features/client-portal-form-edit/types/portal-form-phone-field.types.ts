import type { FieldErrors, UseFormRegister } from 'react-hook-form'
import type { ClientPortalFormValues } from './client-portal-form.types'
import type { PortalFormPhoneField } from './portal-form-widget-field.types'

export type PortalFormPhoneFieldProps = {
  name: PortalFormPhoneField
  label: string
  required: boolean
  pending: boolean
  register: UseFormRegister<ClientPortalFormValues>
  errors: FieldErrors<ClientPortalFormValues>
}
