import type { FormEvent } from 'react'
import type { FieldErrors, UseFormRegister } from 'react-hook-form'
import type { CreateUserFormRole } from '@/entities/user'
import type { CreateUserFormValues } from './create-user-form.types'

export type CreateUserFormRenderProps = {
  apiError: string
  allowedRoles: readonly CreateUserFormRole[]
  register: UseFormRegister<CreateUserFormValues>
  errors: FieldErrors<CreateUserFormValues>
  onSubmit: (e: FormEvent) => void
}
