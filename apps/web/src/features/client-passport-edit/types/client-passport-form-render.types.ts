import type { FormEvent } from 'react'
import type { FieldErrors, UseFormRegister } from 'react-hook-form'
import type { ClientPassportFormValues } from './client-passport-form.types'

export type ClientPassportEditFormRenderProps = {
  apiError: string
  saved: boolean
  pending: boolean
  register: UseFormRegister<ClientPassportFormValues>
  errors: FieldErrors<ClientPassportFormValues>
  onSubmit: (event: FormEvent) => void
}
