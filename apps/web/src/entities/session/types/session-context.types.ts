import type { StaffRole } from '@vises/contracts'
import type { AuthRegisterBody } from '@/shared/api'
import type { Session } from './session.types'

export type SessionContextValue = {
  ready: boolean
  session: Session | null
  loginWithPassword: (login: string, password: string) => Promise<Session | string>
  loginDemo: (role: StaffRole) => Promise<true | string>
  register: (body: AuthRegisterBody) => Promise<Session | string>
  logout: () => void
}
