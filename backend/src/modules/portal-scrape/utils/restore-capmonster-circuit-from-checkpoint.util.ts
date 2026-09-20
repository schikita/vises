import {
  PORTAL_CAPMONSTER_CB_FAILURE_THRESHOLD,
  PORTAL_CAPMONSTER_CB_OPEN_MS,
} from '../constants';
import type {
  CapMonsterCircuitBreaker,
  PortalAutofillCapMonsterCbCheckpoint,
} from '../types';

/**
 * Restore a run-scoped CapMonster CB from durable checkpoint columns (DEC-003).
 * Thresholds come from named constants so restored breakers match live semantics.
 */
export const restoreCapMonsterCircuitFromCheckpoint = (
  checkpoint: PortalAutofillCapMonsterCbCheckpoint,
): CapMonsterCircuitBreaker => ({
  state: checkpoint.state,
  consecutiveTransientFailures: checkpoint.consecutiveFailures,
  openedAtMs:
    checkpoint.openedAt != null ? checkpoint.openedAt.getTime() : null,
  failureThreshold: PORTAL_CAPMONSTER_CB_FAILURE_THRESHOLD,
  openDurationMs: PORTAL_CAPMONSTER_CB_OPEN_MS,
});
