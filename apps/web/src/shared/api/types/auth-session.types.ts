/**
 * Login / register / demo wire response.
 * Not yet in `@vises/contracts`; local transport shape only (plan contracts gaps).
 */
export type AuthSessionUserDto = {
  id: string
  name: string
  firstName: string | null
  lastName: string | null
  login: string
  email: string
  role: string
  active: boolean
  inviteToken: string
  createdAt: string
  updatedAt: string
  password: string
}

export type AuthSessionDto = {
  token: string
  user: AuthSessionUserDto
}
