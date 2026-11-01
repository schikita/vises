import type { User } from '../../database/entities/user.entity';
import { throwForbiddenRole } from './throw-forbidden-role.util';

/**
 * Only agents may create clients, and only for themselves (FR-5 / AC-6).
 * Controller RolesGuard also gates; this is defense-in-depth in the service.
 */
export const assertAgentCreate = (actor: User): void => {
  if (actor.role !== 'agent') {
    throwForbiddenRole();
  }
};
