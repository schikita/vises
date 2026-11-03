import type { Application } from '../../database/entities/application.entity';
import { pickLatestApplicationId } from './pick-latest-application-id.util';

/**
 * Resolve latest application for an agent via Client ownership (DEC-P6).
 * `clientIds` are clients where `agentId = user.id`.
 */
export const resolveLatestAppIdForAgent = (
  apps: readonly Application[],
  clientIds: ReadonlySet<string>,
): string | null => {
  if (clientIds.size === 0) {
    return null;
  }
  const matched = apps.filter((app): boolean => clientIds.has(app.clientId));
  return pickLatestApplicationId(matched);
};
