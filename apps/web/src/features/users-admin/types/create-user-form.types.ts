import type { FormEvent } from 'react'
import type { FieldErrors, UseFormRegister } from 'react-hook-form'
import type { StaffRole } from '@vises/contracts'

export type CreateUserFormRole = Extract<StaffRole, 'agent' | 'admin'>

export type CreateUserFormValues = {
  name: string
  email: string
  login: string
  role: CreateUserFormRole
}

export type CreateUserFormProps = {
  apiError: string
  onValidSubmit: (values: CreateUserFormValues) => Promise<boolean>
}

export type CreateUserFormRenderProps = {
  apiError: string
  register: UseFormRegister<CreateUserFormValues>
  errors: FieldErrors<CreateUserFormValues>
  onSubmit: (e: FormEvent) => void
}
