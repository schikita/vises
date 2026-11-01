import type { CreateUserFormRole } from '@/entities/user'

export type { CreateUserFormRole }

export type CreateUserFormValues = {
  name: string
  email: string
  login: string
  role: CreateUserFormRole
}

export type CreateUserFormProps = {
  apiError: string
  allowedRoles: readonly CreateUserFormRole[]
  onValidSubmit: (values: CreateUserFormValues) => Promise<boolean>
}
