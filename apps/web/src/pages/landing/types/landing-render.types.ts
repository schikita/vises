import type { ReactNode } from 'react'
import type { Session } from '@/entities/session'

export type LandingRenderProps = {
  session: Session | null
  loginForm: ReactNode
}
