/**
 * Durable portal autofill run lifecycle / lock / stage literals (DEC-001 / DEC-007).
 * Named constants only — no helper functions (NFR-004).
 */

/** Run lifecycle status on `portal_autofill_runs.status` (REQ-001). */
export const PORTAL_AUTOFILL_RUN_STATUS = {
  IN_PROGRESS: 'in_progress',
  SUCCEEDED: 'succeeded',
  FAILED: 'failed',
  ABANDONED: 'abandoned',
} as const;

/**
 * Ordered pipeline stage tokens for checkpoint resume (REQ-001 / REQ-003).
 * Aligns with fill pipeline phases; `pre_browser` / `navigating` cover early create.
 */
export const PORTAL_AUTOFILL_PIPELINE_STAGE = {
  PRE_BROWSER: 'pre_browser',
  NAVIGATING: 'navigating',
  BLOCKING_PAGE_GUARD: 'blocking_page_guard',
  FORM_READY: 'form_ready',
  CONSENT: 'consent',
  FIELD_FILL: 'field_fill',
  SCREENSHOT: 'screenshot',
  CAPMONSTER_VERIFY: 'capmonster_verify',
  CAPMONSTER_VERIFIED_LOOP: 'capmonster_verified_loop',
  OTP: 'otp',
  TERMINAL: 'terminal',
} as const;

/** CapMonster CB state literals persisted on the run row (REQ-004 / DEC-003). */
export const PORTAL_AUTOFILL_CAPMONSTER_CB_STATE = {
  CLOSED: 'closed',
  OPEN: 'open',
  HALF_OPEN: 'half-open',
} as const;

/** Per-field checkpoint status (REQ-005) — values never stored. */
export const PORTAL_AUTOFILL_FIELD_PROGRESS_STATUS = {
  FILLED: 'filled',
  SKIPPED: 'skipped',
  FAILED: 'failed',
} as const;

/** Executor lock heartbeat interval (DEC-007 / NFR-004). */
export const PORTAL_AUTOFILL_LOCK_HEARTBEAT_MS = 30_000;

/**
 * Lock is stale when `lock_heartbeat_at` is older than this TTL (DEC-007).
 * Reclaimable by recovery / next POST (REQ-009).
 */
export const PORTAL_AUTOFILL_LOCK_STALE_MS = 120_000;

/** Russian `{ detail }` when a live lock blocks concurrent POST (DEC-009 / NFR-008). */
export const PORTAL_AUTOFILL_MSG_RUN_LOCKED =
  'Автозаполнение уже выполняется для этой заявки';
