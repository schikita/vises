import type { StaffRole } from '@vises/contracts';
import { throwForbiddenRole } from './throw-forbidden-role.util';
import { throwSuperadminExists } from './throw-superadmin-exists.util';

/**
 * FR-1.3–1.4 / §6.2 — role assignment on create/patch.
 * Creating/promoting to `superadmin` via API is always forbidden; if one
 * already exists, prefer NFR-6 `superadmin_exists` (409). Keeping an existing
 * superadmin's role unchanged is allowed.
 */
export const assertCanAssignStaffRole = (params: {
  actorRole: StaffRole;
  targetRole: StaffRole;
  superadminCount: number;
  currentRole?: StaffRole;
}): void => {
  if (params.targetRole === 'superadmin') {
    if (params.currentRole === 'superadmin') {
      return;
    }
    if (params.superadminCount > 0) {
      throwSuperadminExists();
    }
    throwForbiddenRole();
  }
  if (params.targetRole === 'admin' && params.actorRole !== 'superadmin') {
    throwForbiddenRole();
  }
};
