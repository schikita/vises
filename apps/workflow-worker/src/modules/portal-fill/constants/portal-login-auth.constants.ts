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

/**
 * Best-effort settle after email-step `#btnVerify` before password discovery
 * (`domcontentloaded`, not `networkidle`) — portal-login-prep-nav-race DEC-001.
 */
export const PORTAL_LOGIN_POST_VERIFY_SETTLE_MS = 5_000;

/**
 * Patchright/Playwright needle for navigate-destroyed execution context
 * (portal-login-prep-nav-race DEC-002 / REQ-002).
 */
export const PORTAL_NAVIGATION_CONTEXT_DESTROYED_ERROR_NEEDLE =
  'Execution context was destroyed, most likely because of a navigation';
