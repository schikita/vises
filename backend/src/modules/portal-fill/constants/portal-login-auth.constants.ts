/**
 * Login password-submit + authenticated-landing timings (REQ-011 / TASK-009).
 * Named constants only — no helper functions.
 */

/** Wait for password decoys after email verify / navigation. */
export const PORTAL_LOGIN_PASSWORD_WAIT_MS = 30_000;

/** Wait for login form cues to clear after password submit. */
export const PORTAL_LOGIN_AUTH_WAIT_MS = 30_000;

/** Poll interval while waiting for password controls or auth landing. */
export const PORTAL_LOGIN_AUTH_POLL_MS = 500;
