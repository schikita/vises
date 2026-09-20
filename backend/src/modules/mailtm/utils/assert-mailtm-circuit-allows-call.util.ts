import { MAILTM_CIRCUIT_OPEN_REASON } from '../constants';
import type { MailTmCircuitBreaker } from '../types';

/**
 * Gate Mail.tm create/wait before a protected call (DEC-002).
 * Open + cooldown elapsed → half-open and allow one probe.
 * Still open within cooldown → throw explicit circuit-open reason.
 */
export const assertMailTmCircuitAllowsCall = (
  breaker: MailTmCircuitBreaker,
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

  throw new Error(MAILTM_CIRCUIT_OPEN_REASON);
};
