import type {
  CapMonsterCircuitBreaker,
  PortalAutofillCapMonsterCbCheckpoint,
} from '../types';

/**
 * Map in-memory CapMonster CB to durable checkpoint fields (REQ-004 / DEC-003).
 * Does not include secrets or task payloads.
 */
export const serializeCapMonsterCircuitForCheckpoint = (
  breaker: CapMonsterCircuitBreaker,
): PortalAutofillCapMonsterCbCheckpoint => ({
  state: breaker.state,
  consecutiveFailures: breaker.consecutiveTransientFailures,
  openedAt:
    breaker.openedAtMs != null ? new Date(breaker.openedAtMs) : null,
});
