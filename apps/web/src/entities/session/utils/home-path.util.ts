import type { StaffRole } from '@vises/contracts'

/** FR-1: staff → `/admin`, agent → `/app`. */
export const homePath = (role: StaffRole): string => {
  if (role === 'agent') return '/app'
  return '/admin'
}
