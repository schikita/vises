import type { FieldErrors, UseFormSetValue } from 'react-hook-form'
import type { ClientPortalFormValues } from './client-portal-form.types'
import type { PortalFormSelectField } from './portal-form-widget-field.types'

export type PortalFormSelectFieldProps = {
  name: PortalFormSelectField
  label: string
  required: boolean
  pending: boolean
  value: string
  setValue: UseFormSetValue<ClientPortalFormValues>
  errors: FieldErrors<ClientPortalFormValues>
}
