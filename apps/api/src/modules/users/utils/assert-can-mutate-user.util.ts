import type { StaffRole } from '@vises/contracts';
import { throwForbiddenRole } from './throw-forbidden-role.util';

/**
 * FR-1.3–1.4 / AC-2 / §6.2 — who may patch, reissue, or delete a target user.
 * Superadmin may mutate any staff user; admin may mutate agents only.
 */
export const assertCanMutateUser = (params: {
  actorRole: StaffRole;
  targetRole: StaffRole;
}): void => {
  if (params.actorRole === 'superadmin') {
    return;
  }
  if (params.actorRole === 'admin' && params.targetRole === 'agent') {
    return;
  }
  throwForbiddenRole();
};
