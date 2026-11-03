import type { StaffRole } from '@vises/contracts'

/**
 * DEC-P9: Superadmin → Superadmin; Admin → Admin; Agent → hide badge.
 */
export const resolveShellBadgeLabelKey = (
  role: StaffRole | undefined,
): string | null => {
  if (role === 'superadmin') {
    return 'chrome.shell.badge.superadmin'
  }
  if (role === 'admin') {
    return 'chrome.shell.badge.admin'
  }
  return null
}
