import type { StaffRole } from '@vises/contracts';
import { throwForbiddenRole } from './throw-forbidden-role.util';

/**
 * History read ACL (T14.2): admin/superadmin any app; agent own clients only.
 */
export const assertCanReadApplicationHistory = (params: {
  actorRole: StaffRole;
  actorId: string;
  ownerAgentId: string;
}): void => {
  if (params.actorRole === 'admin' || params.actorRole === 'superadmin') {
    return;
  }
  if (params.actorRole === 'agent' && params.actorId === params.ownerAgentId) {
    return;
  }
  throwForbiddenRole();
};
