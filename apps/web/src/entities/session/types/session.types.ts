import type { Role } from '@/entities/user'

export type Session = {
  userId: string
  role: Role
  name: string
  email: string
  login: string
}
