import type { User } from '../../database/entities/user.entity';
import { throwForbiddenRole } from './throw-forbidden-role.util';

/**
 * FR-9: admin/superadmin → full (null scope); agent → self id only.
 */
export const resolveAnalyticsAgentScopeId = (actor: User): string | null => {
  if (actor.role === 'admin' || actor.role === 'superadmin') {
    return null;
  }
  if (actor.role === 'agent') {
    return actor.id;
  }
  return throwForbiddenRole();
};
