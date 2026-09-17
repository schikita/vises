import type { User } from './user.types'

/** Credentials returned when staff create mints/reissues a client. */
export type IssuedAccess = {
  user: User
  password: string
  token: string
}
