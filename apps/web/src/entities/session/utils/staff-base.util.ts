import type { StaffRole } from '@vises/contracts'
import { homePath } from './home-path.util'

/** Base path for staff shells (`/admin`); agents use `/app` via `homePath`. */
export const staffBase = (role?: StaffRole | null): string => {
  if (!role) return '/admin'
  return homePath(role)
}
