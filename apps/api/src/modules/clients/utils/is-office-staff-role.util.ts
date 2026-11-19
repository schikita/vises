/**
 * Admin and superadmin create applications without an agent balance (DEC-ACU-002).
 */
export const isOfficeStaffRole = (role: string): boolean =>
  role === 'admin' || role === 'superadmin';
