import { TEMPORARY_EMAIL_CIRCUIT_OPEN_REASON } from '../constants';
import type { TemporaryEmailCircuitBreaker } from '../types';

/**
 * Gate temporary email create/wait before a protected call (DEC-002).
 * Open + cooldown elapsed → half-open and allow one probe.
 * Still open within cooldown → throw explicit circuit-open reason.
 */
export const assertTemporaryEmailCircuitAllowsCall = (
  breaker: TemporaryEmailCircuitBreaker,
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

  throw new Error(TEMPORARY_EMAIL_CIRCUIT_OPEN_REASON);
};
