import {
  PORTAL_CAPMONSTER_CB_FAILURE_THRESHOLD,
  PORTAL_CAPMONSTER_CB_OPEN_MS,
} from '../constants';
import type { CapMonsterCircuitBreaker } from '../types';

/** Create a closed run-scoped CapMonster circuit-breaker (DEC-003). */
export const createCapMonsterCircuitBreaker = (): CapMonsterCircuitBreaker => ({
  state: 'closed',
  consecutiveTransientFailures: 0,
  openedAtMs: null,
  failureThreshold: PORTAL_CAPMONSTER_CB_FAILURE_THRESHOLD,
  openDurationMs: PORTAL_CAPMONSTER_CB_OPEN_MS,
});
