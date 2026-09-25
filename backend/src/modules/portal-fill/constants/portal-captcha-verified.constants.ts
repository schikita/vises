/**
 * Portal captcha Verified-loop + captcha-service circuit-breaker budgets
 * (DEC-005 / DEC-006).
 */

/** Case-sensitive substring required on the Verified control (REQ-001). */
export const PORTAL_CAPTCHA_VERIFIED_TEXT = 'Verified';

/** Outer Verified-loop attempt cap (extract → solve → apply cycles). */
export const PORTAL_CAPTCHA_VERIFIED_LOOP_MAX_ATTEMPTS = 5;

/** Outer Verified-loop wall-clock budget (ms). */
export const PORTAL_CAPTCHA_VERIFIED_LOOP_MAX_MS = 300_000;

/** Settle wait after apply before checking Verified (ms). */
export const PORTAL_CAPTCHA_VERIFIED_SETTLE_MS = 2_000;

/**
 * Dedicated after-apply wait for visible `#btnVerified` within remaining outer budget (DEC-004).
 * Caps per-attempt wait; outer MAX_ATTEMPTS / MAX_MS unchanged.
 */
export const PORTAL_CAPTCHA_VERIFIED_AFTER_APPLY_WAIT_MS = 45_000;

/** Poll interval while waiting for `#btnVerified` after captcha apply (ms). */
export const PORTAL_CAPTCHA_VERIFIED_AFTER_APPLY_POLL_MS = 500;

/** Consecutive captcha-service transient failures before circuit opens. */
export const PORTAL_CAPMONSTER_CB_FAILURE_THRESHOLD = 3;

/** Cooldown after open before half-open probe (ms). */
export const PORTAL_CAPMONSTER_CB_OPEN_MS = 15_000;

/** Fixed backoff after transient captcha-service failure before next attempt (ms). */
export const PORTAL_CAPMONSTER_TRANSIENT_BACKOFF_MS = 2_000;

/** Explicit circuit-open reason for captcha-phase hard-fail messaging. */
export const PORTAL_CAPMONSTER_CIRCUIT_OPEN_REASON =
  'captcha service circuit is open; refusing new solve requests';

/** Outer Verified-loop budget exhausted (attempts and/or wall-clock). */
export const PORTAL_CAPTCHA_VERIFIED_BUDGET_EXHAUSTED_REASON =
  'Portal captcha Verified loop budget exhausted without #btnVerified';

/**
 * Max CapMonster `ERROR_CAPTCHA_UNSOLVABLE` create+poll tries per Verified
 * episode (capmonster-unsolvable-ten-retry DEC-006 / REQ-001).
 */
export const PORTAL_CAPMONSTER_UNSOLVABLE_MAX_TRIES = 10;

/**
 * Linear progressive backoff step after in-budget CapMonster unsolvable try `n`
 * (wait `n * STEP` ms before try `n+1`; DEC-011 / REQ-013).
 * Unsolvable path only — other CapMonster transient keeps
 * `PORTAL_CAPMONSTER_TRANSIENT_BACKOFF_MS`.
 */
export const PORTAL_CAPMONSTER_UNSOLVABLE_BACKOFF_STEP_MS = 5_000;

/**
 * Durable companion `errorCode` when the unsolvable try budget is exhausted
 * (DEC-002). Distinct from CapMonster's live `ERROR_CAPTCHA_UNSOLVABLE`.
 */
export const PORTAL_CAPMONSTER_UNSOLVABLE_TRIES_EXHAUSTED_ERROR_CODE =
  'ERROR_CAPTCHA_UNSOLVABLE_TRIES_EXHAUSTED' as const;

/**
 * Operator/log message for unsolvable try exhaustion (no secrets/images).
 * Mentions CapMonster `ERROR_CAPTCHA_UNSOLVABLE` and the named try budget.
 */
export const PORTAL_CAPMONSTER_UNSOLVABLE_TRIES_EXHAUSTED_MESSAGE =
  `CapMonster ERROR_CAPTCHA_UNSOLVABLE: ${PORTAL_CAPMONSTER_UNSOLVABLE_MAX_TRIES} solve tries exhausted`;

/**
 * Probe wait for iframe/challenge before adaptive `#btnVerify` (DEC-002).
 * Keeps a missing-challenge probe from consuming the full outer budget.
 * Also reused as the post-chain-wait same-kind presence probe budget
 * (capmonster-chained-captcha DEC-004).
 */
export const PORTAL_CAPTCHA_CHALLENGE_READY_PROBE_MS = 15_000;

/**
 * Post-pass chain delay before probing for another same-kind BLS 3×3
 * captcha (capmonster-chained-captcha DEC-002 / REQ-001).
 * Always waited in full after each successful solve-apply in a chain
 * sequence (DEC-007), including when `#btnVerified` is already visible.
 */
export const PORTAL_CAPTCHA_CHAIN_WAIT_AFTER_PASS_MS = 5_000;

/**
 * Max successful follow-up solve-applies after the first pass in one
 * chain sequence (capmonster-chained-captcha DEC-002 / REQ-005).
 * ⇒ ≤ `1 + PORTAL_CAPTCHA_CHAIN_MAX_FOLLOW_UPS` successful applies total.
 */
export const PORTAL_CAPTCHA_CHAIN_MAX_FOLLOW_UPS = 3;