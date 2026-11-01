import type { StaffRole } from '@vises/contracts'

export type Session = {
  userId: string
  role: StaffRole
  name: string
  email: string
  login: string
  active: boolean
  balance: string | null
}
