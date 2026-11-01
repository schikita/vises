import type { User } from '../../database/entities/user.entity';
import type { Client } from '../../database/entities/client.entity';
import { throwClientNotFound } from './throw-client-not-found.util';
import { throwForbiddenRole } from './throw-forbidden-role.util';

/**
 * Agent may only access own clients; admin/superadmin may access any (FR-5 / §6.5).
 * Missing → `client_not_found`. Cross-tenant agent → `forbidden_role` (Decision 2A).
 */
export const assertCanAccessClient = (
  client: Client | null,
  actor: User,
): Client => {
  if (!client) {
    return throwClientNotFound();
  }
  if (actor.role === 'admin' || actor.role === 'superadmin') {
    return client;
  }
  if (actor.role === 'agent' && client.agentId === actor.id) {
    return client;
  }
  return throwForbiddenRole();
};
