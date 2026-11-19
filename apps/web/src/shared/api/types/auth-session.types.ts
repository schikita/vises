/**
 * Login / register / demo wire response (API `UserOut` + token).
 */
export type AuthSessionUserDto = {
  id: string
  name: string
  login: string
  email: string
  role: string
  active: boolean
  inviteToken: string
  createdAt: string
  updatedAt: string
  password?: string
}

export type AuthSessionDto = {
  token: string
  user: AuthSessionUserDto
}
