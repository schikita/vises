import type {
  FieldErrors,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from 'react-hook-form'
import type { ClientPortalFormValues, PortalFormField } from './client-portal-form.types'

export type PortalFormControlProps = {
  name: PortalFormField
  label: string
  required: boolean
  pending: boolean
  register: UseFormRegister<ClientPortalFormValues>
  setValue: UseFormSetValue<ClientPortalFormValues>
  watch: UseFormWatch<ClientPortalFormValues>
  errors: FieldErrors<ClientPortalFormValues>
}
