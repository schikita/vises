/**
 * Portal overlay / preloader wait selectors and timings
 * (successful-enter FR-5).
 * Named constants only — no helper functions.
 */

/** Full-page preloader root. */
export const PORTAL_OVERLAY_PRELOADER_SELECTOR = '.preloader';

/** Global interaction-blocking overlay. */
export const PORTAL_OVERLAY_GLOBAL_SELECTOR = '#global-overlay';

/** Max wait for overlays to clear (~30s class). */
export const PORTAL_OVERLAY_CLEAR_WAIT_MS = 30_000;

/** Poll interval while waiting for overlays to clear (ms). */
export const PORTAL_OVERLAY_CLEAR_POLL_MS = 250;
