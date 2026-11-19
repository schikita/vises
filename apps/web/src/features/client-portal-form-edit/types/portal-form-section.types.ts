import type {
  FieldErrors,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from 'react-hook-form'
import type { ClientPortalFormValues } from './client-portal-form.types'

export type PortalFormSectionProps = {
  register: UseFormRegister<ClientPortalFormValues>
  errors: FieldErrors<ClientPortalFormValues>
  setValue: UseFormSetValue<ClientPortalFormValues>
  watch: UseFormWatch<ClientPortalFormValues>
  pending: boolean
}
