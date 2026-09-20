/**
 * Mail.tm run-scoped circuit-breaker thresholds (DEC-002 / NFR-006).
 * Discoverable module constants — not env keys (REQ-013).
 */

/** Consecutive transient failures before opening (mirrors CapMonster count). */
export const MAILTM_CB_FAILURE_THRESHOLD = 3;

/** Open cooldown before half-open probe (ms); longer than CapMonster for rate-limit recovery. */
export const MAILTM_CB_OPEN_MS = 30_000;

/** Explicit fail-fast reason while open within cooldown (REQ-015). */
export const MAILTM_CIRCUIT_OPEN_REASON =
  'Mail.tm circuit is open; refusing create/wait';
