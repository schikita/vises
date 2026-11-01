import type { ApplicationStatusHistoryActorRole } from '@vises/contracts';
import { APPLICATION_STATUS_TRANSITION_ACTORS } from '../constants/application-status-transition-actors.constants';

const isKnownHistoryActorRole = (
  value: string,
): value is Exclude<ApplicationStatusHistoryActorRole, 'unknown'> =>
  (APPLICATION_STATUS_TRANSITION_ACTORS as readonly string[]).includes(value);

/**
 * Narrow persisted `actor_role` string → contract ApplicationStatusHistoryActorRole.
 * Unrecognized DB values map to stable `"unknown"` (T15.4) — never throw.
 */
export const narrowHistoryActorRole = (
  value: string,
): ApplicationStatusHistoryActorRole => {
  if (!isKnownHistoryActorRole(value)) {
    return 'unknown';
  }
  return value;
};
