import type { Application } from '../../database/entities/application.entity';
import type { AgentOwnedApplicationRow } from '../types/agent-owned-application-row.types';
import type { ResolveLatestAppIdUser } from '../types/resolve-latest-app-id-user.types';
import { pickLatestApplicationId } from './pick-latest-application-id.util';

/**
 * Resolve `latestAppId` for a users-list row.
 *
 * - `role === 'agent'`: apps owned via `Client.agentId` (DEC-ASAU-005 / REQ-013).
 * - Otherwise: match `application.clientEmail` to user email/login.
 * Latest = max `updatedAt`, then `createdAt`. Null only when zero matches.
 */
export const resolveLatestAppIdForUserIdentity = (
  apps: readonly Application[],
  user: ResolveLatestAppIdUser,
  agentOwnedAppsByAgentId?: ReadonlyMap<
    string,
    readonly AgentOwnedApplicationRow[]
  >,
): string | null => {
  if (user.role === 'agent') {
    const owned = agentOwnedAppsByAgentId?.get(user.id) ?? [];
    return pickLatestApplicationId(owned);
  }

  const email = user.email.trim().toLowerCase();
  const login = user.login.trim().toLowerCase();

  const matched = apps.filter((app): boolean => {
    const client = (app.clientEmail ?? '').trim().toLowerCase();
    if (!client) {
      return false;
    }
    return (email !== '' && client === email) || (login !== '' && client === login);
  });

  return pickLatestApplicationId(matched);
};
