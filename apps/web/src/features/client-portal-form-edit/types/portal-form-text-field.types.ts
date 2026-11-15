import type { FieldErrors, UseFormRegister } from 'react-hook-form'
import type { ClientPortalFormValues, PortalFormField } from './client-portal-form.types'

export type PortalFormTextFieldProps = {
  name: PortalFormField
  label: string
  required: boolean
  pending: boolean
  register: UseFormRegister<ClientPortalFormValues>
  errors: FieldErrors<ClientPortalFormValues>
  uppercase?: boolean
}
