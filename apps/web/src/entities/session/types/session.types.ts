import type { Role, User } from '@/entities/user'

export type Session = {
  userId: string
  role: Role
  name: string
  email: string
  login: string
}

/** Login `User` or slim `GET /auth/me` payload (email + role, optional name/login). */
export type SessionUserInput = Pick<User, 'id' | 'role'> &
  Partial<Pick<User, 'name' | 'login' | 'email'>> & {
    email?: string
  }
