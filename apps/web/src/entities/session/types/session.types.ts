import type { StaffRole } from '@vises/contracts'

export type Session = {
  userId: string
  role: StaffRole
  name: string
  firstName: string | null
  lastName: string | null
  email: string
  login: string
  active: boolean
  balance: string | null
}
