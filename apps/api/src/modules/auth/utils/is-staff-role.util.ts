import { STAFF_ROLES } from '@vises/contracts';
import type { StaffRole } from '@vises/contracts';

/** Narrow a JWT/demo role string to StaffRole (FR-1 / FR-12). */
export const isStaffRole = (role: string): role is StaffRole =>
  (STAFF_ROLES as readonly string[]).includes(role);
