import type { FormEvent } from 'react'
import type { FieldErrors, UseFormRegister } from 'react-hook-form'
import type { AuthLoginFormValues } from './auth-login-form.types'

export type AuthLoginFormRenderProps = {
  apiError: string
  register: UseFormRegister<AuthLoginFormValues>
  errors: FieldErrors<AuthLoginFormValues>
  onSubmit: (e: FormEvent) => void
}
