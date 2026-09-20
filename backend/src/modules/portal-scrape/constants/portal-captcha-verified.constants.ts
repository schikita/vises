/**
 * Portal captcha Verified-loop + CapMonster circuit-breaker budgets (DEC-005 / DEC-006).
 */

/** Case-sensitive substring required on the Verified control (REQ-001). */
export const PORTAL_CAPTCHA_VERIFIED_TEXT = 'Verified';

/** Outer Verified-loop attempt cap (extract → solve → apply cycles). */
export const PORTAL_CAPTCHA_VERIFIED_LOOP_MAX_ATTEMPTS = 5;

/** Outer Verified-loop wall-clock budget (ms). */
export const PORTAL_CAPTCHA_VERIFIED_LOOP_MAX_MS = 300_000;

/** Settle wait after apply before checking Verified (ms). */
export const PORTAL_CAPTCHA_VERIFIED_SETTLE_MS = 2_000;

/** Consecutive CapMonster transient failures before circuit opens. */
export const PORTAL_CAPMONSTER_CB_FAILURE_THRESHOLD = 3;

/** Cooldown after open before half-open probe (ms). */
export const PORTAL_CAPMONSTER_CB_OPEN_MS = 15_000;

/** Fixed backoff after transient CapMonster failure before next attempt (ms). */
export const PORTAL_CAPMONSTER_TRANSIENT_BACKOFF_MS = 2_000;

/** Explicit circuit-open reason for captcha-phase hard-fail messaging. */
export const PORTAL_CAPMONSTER_CIRCUIT_OPEN_REASON =
  'CapMonster circuit is open; refusing new createTask/getTaskResult';

/** Outer Verified-loop budget exhausted (attempts and/or wall-clock). */
export const PORTAL_CAPTCHA_VERIFIED_BUDGET_EXHAUSTED_REASON =
  'Portal captcha Verified loop budget exhausted without #btnVerified';

/**
 * Probe wait for iframe/challenge before adaptive `#btnVerify` (DEC-002).
 * Keeps a missing-challenge probe from consuming the full outer budget.
 */
export const PORTAL_CAPTCHA_CHALLENGE_READY_PROBE_MS = 15_000;