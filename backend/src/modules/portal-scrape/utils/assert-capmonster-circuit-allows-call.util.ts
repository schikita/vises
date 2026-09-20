import { PORTAL_CAPMONSTER_CIRCUIT_OPEN_REASON } from '../constants';
import type { CapMonsterCircuitBreaker } from '../types';

/**
 * Gate CapMonster HTTP before a new createTask (DEC-003).
 * Open + cooldown elapsed → half-open and allow one probe.
 * Still open within cooldown → throw explicit circuit-open reason.
 */
export const assertCapMonsterCircuitAllowsCall = (
  breaker: CapMonsterCircuitBreaker,
  nowMs: number,
): void => {
  if (breaker.state === 'closed' || breaker.state === 'half-open') {
    return;
  }

  if (
    breaker.openedAtMs !== null &&
    nowMs - breaker.openedAtMs >= breaker.openDurationMs
  ) {
    breaker.state = 'half-open';
    return;
  }

  throw new Error(PORTAL_CAPMONSTER_CIRCUIT_OPEN_REASON);
};
