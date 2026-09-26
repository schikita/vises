/**
 * BLS CAPTCHA selector contract — dual surface (portal-login-inline-captcha DEC-005).
 *
 * Surfaces:
 * - **iframe (register / GenerateCaptcha):** parent
 *   `iframe.k-content-frame` → `/Global/CaptchaPublic/GenerateCaptcha`.
 *   Confirm control is `#submit` (Submit Selection) after cell clicks
 *   (prefer portal `onSubmit()` in that document when present).
 * - **inline (login password/captcha page):** challenge lives in the main
 *   document under `#captcha-main-div` / `.main-div-container` (CON-004
 *   sample `login_captcha.html` — no GenerateCaptcha iframe). Confirm
 *   control is `#btnVerify` with portal `onSubmit()` when available
 *   (NOT `#submit`).
 *
 * Live DOM quirks (must not use naïve `querySelectorAll('.captcha-img')`):
 * - Dozens of decoy `img.captcha-img` cells; only ~9 are visible in the 3×3.
 * - Many decoy `.box-label` lines; real TaskArgument is the readable
 *   (non-camouflaged near-white) label: "Please select all boxes with number NNN".
 */

export type PortalCaptchaSelectorSet = {
  /** Parent-page iframe that hosts GenerateCaptcha (iframe surface only). */
  iframe: string;
  /** Root of the 3×3 grid host (iframe document or main-frame inline). */
  challengeRoot: string;
  /**
   * Candidate cell images; extract/apply keep only **visible** nodes and sort
   * by geometry into captcha-provider index order 0..8 (row-major).
   */
  cellImages: string;
  /** Clickable targets (same visible set as cellImages for this portal). */
  cellClickTargets: string;
  /** Candidate TaskArgument labels; extract keeps the visible non-decoy one. */
  taskArgument: string;
  /**
   * Post-answer confirm control.
   * Iframe/register default: `#submit`. Inline/login: `#btnVerify`
   * (`PORTAL_CAPTCHA_INLINE_CONFIRM_CONTROL`) — see DEC-005.
   */
  confirmControl: string;
};

/**
 * Default selectors for BLS GenerateCaptcha **iframe** content
 * (`confirmControl` = `#submit`). Inline surface clones this set and
 * overrides `confirmControl` to `PORTAL_CAPTCHA_INLINE_CONFIRM_CONTROL`.
 */
export const PORTAL_CAPTCHA_SELECTORS: PortalCaptchaSelectorSet = {
  iframe:
    'iframe.k-content-frame[title="Verify Registration"], iframe.k-content-frame',
  challengeRoot: '.main-div-container',
  cellImages: '.main-div-container img.captcha-img',
  cellClickTargets: '.main-div-container img.captcha-img',
  taskArgument: '.box-label',
  confirmControl: '#submit',
};

/**
 * Main-document wrapper for login inline captcha (CON-004 sample).
 * Presence probe may use this and/or `PORTAL_CAPTCHA_INLINE_CHALLENGE_ROOT`.
 */
export const PORTAL_CAPTCHA_INLINE_ROOT = '#captcha-main-div';

/**
 * Inline / shared challenge grid host (same class as iframe challenge root).
 */
export const PORTAL_CAPTCHA_INLINE_CHALLENGE_ROOT = '.main-div-container';

/**
 * Login inline confirm control after cell clicks (DEC-005 / REQ-005).
 * Sample button text may be "Submit"; selector remains `#btnVerify`.
 */
export const PORTAL_CAPTCHA_INLINE_CONFIRM_CONTROL = '#btnVerify';

/** Required selectors that must be non-empty before extract/apply. */
export const PORTAL_CAPTCHA_REQUIRED_SELECTOR_KEYS = [
  'iframe',
  'challengeRoot',
  'cellImages',
  'cellClickTargets',
  'taskArgument',
  'confirmControl',
] as const satisfies ReadonlyArray<keyof PortalCaptchaSelectorSet>;

/** Parse target digits from visible box-label copy. */
export const PORTAL_CAPTCHA_TASK_ARGUMENT_PATTERN =
  /Please select all boxes with number\s+(\d+)/i;

/** Iframe URL fragment for `page.frames()` matching. */
export const PORTAL_CAPTCHA_IFRAME_URL_PATTERN =
  /CaptchaPublic|GenerateCaptcha/i;
