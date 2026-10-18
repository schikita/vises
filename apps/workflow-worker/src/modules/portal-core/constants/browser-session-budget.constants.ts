/**
 * Per-attempt Chromium session budget when tempmail_plus keeps mail + portal
 * browsers live (REQ-024 / DEC-001 / DEC-012).
 */
export const PORTAL_BROWSER_SESSIONS_PER_ATTEMPT = 2;

/** Default VISES_PORTAL_MAX_ATTEMPTS_PER_WORKER when unset/invalid (DEC-004). */
export const PORTAL_MAX_ATTEMPTS_PER_WORKER_DEFAULT = 1;

/** Safe structured log / error token when session or attempt cap is hit. */
export const PORTAL_CONCURRENCY_CAP_HIT = 'concurrency_cap_hit';
