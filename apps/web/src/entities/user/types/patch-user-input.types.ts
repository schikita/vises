import type { Role } from './user.types'

/** PATCH /users/:userId body (staff ACL enforced server-side). */
export type PatchUserInput = {
  name?: string
  login?: string
  email?: string
  role?: Role
  active?: boolean
}
