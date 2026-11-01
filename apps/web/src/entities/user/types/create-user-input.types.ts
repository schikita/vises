import type { CreateUserFormRole } from './create-user-form-role.types'

/** POST /users body — never includes `superadmin` (FR-4 / AC-6). */
export type CreateUserInput = {
  name: string
  email?: string
  login?: string
  role: CreateUserFormRole
}
