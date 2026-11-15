import type { FormEvent } from 'react'
import type {
  FieldErrors,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from 'react-hook-form'
import type { ClientPortalFormValues } from './client-portal-form.types'

export type ClientPortalFormEditFormRenderProps = {
  tripDisabled: boolean
  tripDisabledMessage: string
  passportError: string
  portalFormError: string
  tripError: string
  saved: boolean
  pending: boolean
  register: UseFormRegister<ClientPortalFormValues>
  setValue: UseFormSetValue<ClientPortalFormValues>
  watch: UseFormWatch<ClientPortalFormValues>
  errors: FieldErrors<ClientPortalFormValues>
  onSubmit: (event: FormEvent) => void
}
