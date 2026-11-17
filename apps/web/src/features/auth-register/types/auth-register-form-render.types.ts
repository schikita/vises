import type { FormEvent } from 'react'
import type { FieldErrors, UseFormRegister } from 'react-hook-form'
import type { AuthRegisterFormValues } from './auth-register-form.types'

export type AuthRegisterFormRenderProps = {
  apiError: string
  register: UseFormRegister<AuthRegisterFormValues>
  errors: FieldErrors<AuthRegisterFormValues>
  onSubmit: (e: FormEvent) => void
}
