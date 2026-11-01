import type { StaffRole } from '@vises/contracts';
import { throwForbiddenRole } from './throw-forbidden-role.util';

/**
 * Ledger read ACL (§6.4): admin/superadmin any agent; agent self only.
 */
export const assertCanReadLedger = (params: {
  actorRole: StaffRole;
  actorId: string;
  agentId: string;
}): void => {
  if (params.actorRole === 'admin' || params.actorRole === 'superadmin') {
    return;
  }
  if (params.actorRole === 'agent' && params.actorId === params.agentId) {
    return;
  }
  throwForbiddenRole();
};
