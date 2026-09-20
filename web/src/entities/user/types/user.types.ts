export type Role = 'admin' | 'manager' | 'client'

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
