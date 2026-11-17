import type { StaffRole } from '@vises/contracts'

/** Staff roles only — aligned with `@vises/contracts` `StaffRole`. */
export type Role = StaffRole

export type User = {
  id: string
  name: string
  login: string
  email: string
  /** Present on invite/create/reissue flows; omitted from `GET /auth/me`. */
  password?: string
  role: Role
  active: boolean
  inviteToken: string
  createdAt: string
  updatedAt: string
}
