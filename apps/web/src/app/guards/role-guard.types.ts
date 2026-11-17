import type { ReactNode } from 'react'
import type { Role } from '@/entities/user'

export type RoleGuardProps = {
  roles: Role[]
  children: ReactNode
}
