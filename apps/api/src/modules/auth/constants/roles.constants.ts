import { STAFF_ROLES } from '@vises/contracts';
import type { StaffRole } from '@vises/contracts';

/** Staff roles (FR-1 / AC-1). Alias kept for existing auth/users imports. */
export const USER_ROLES = STAFF_ROLES;

/** Public registration and staff-created agents default to agent (FR-2). */
export const DEFAULT_USER_ROLE: StaffRole = 'agent';

export const ADMIN_ROLE: StaffRole = 'admin';

export const SUPERADMIN_ROLE: StaffRole = 'superadmin';

export const AGENT_ROLE: StaffRole = 'agent';
