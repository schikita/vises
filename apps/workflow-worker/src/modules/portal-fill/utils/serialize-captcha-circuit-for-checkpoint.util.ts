import type {
  CaptchaCircuitBreaker,
  PortalAutofillCapMonsterCbCheckpoint,
} from '../types';

/**
 * Map in-memory captcha CB to durable checkpoint fields (REQ-004 / DEC-003).
 * Does not include secrets or task payloads.
 * Persistence shape remains PortalAutofillCapMonsterCbCheckpoint (DEC-009).
 */
export const serializeCaptchaCircuitForCheckpoint = (
  breaker: CaptchaCircuitBreaker,
): PortalAutofillCapMonsterCbCheckpoint => ({
  state: breaker.state,
  consecutiveFailures: breaker.consecutiveTransientFailures,
  openedAt:
    breaker.openedAtMs != null ? new Date(breaker.openedAtMs) : null,
});
