import { STAFF_ROLES } from '@vises/contracts'
import type { StaffRole } from '@vises/contracts'

export const isStaffRole = (value: string): value is StaffRole =>
  (STAFF_ROLES as readonly string[]).includes(value)
