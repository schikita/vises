import type { ReactNode } from 'react'
import type { StaffRole } from '@vises/contracts'

export type RoleGuardProps = {
  /** Allowed roles for this tree — must be a subset of the three-role StaffRole union. */
  roles: readonly StaffRole[]
  children: ReactNode
}
