import type {
  FieldErrors,
  UseFormRegister,
  UseFormSetValue,
} from 'react-hook-form'
import type { ClientPortalFormValues } from './client-portal-form.types'
import type { PortalFormDateField } from './portal-form-widget-field.types'

export type PortalFormDateFieldProps = {
  name: PortalFormDateField
  label: string
  required: boolean
  pending: boolean
  value: string
  register: UseFormRegister<ClientPortalFormValues>
  setValue: UseFormSetValue<ClientPortalFormValues>
  errors: FieldErrors<ClientPortalFormValues>
}
