/**
 * RegisterUser BLS CAPTCHA selector contract (DEC-009 / REQ-015).
 *
 * Evidence: operator sample `capcha.html` (Verify Registration Kendo window +
 * `iframe.k-content-frame` → `/Global/CaptchaPublic/GenerateCaptcha`).
 *
 * Live DOM quirks (must not use naïve `querySelectorAll('.captcha-img')`):
 * - Challenge runs inside an iframe (not the RegisterUser parent document).
 * - Dozens of decoy `img.captcha-img` cells; only ~9 are visible in the 3×3.
 * - Many decoy `.box-label` lines; real TaskArgument is the readable
 *   (non-camouflaged near-white) label: "Please select all boxes with number NNN".
 * - Confirm control is `#submit` (Submit Selection) after cell clicks.
 */

export type PortalCaptchaSelectorSet = {
  /** Parent-page iframe that hosts GenerateCaptcha. */
  iframe: string;
  /** Root inside the iframe (330×330 grid host). */
  challengeRoot: string;
  /**
   * Candidate cell images; extract/apply keep only **visible** nodes and sort
   * by geometry into CapMonster index order 0..8 (row-major).
   */
  cellImages: string;
  /** Clickable targets (same visible set as cellImages for this portal). */
  cellClickTargets: string;
  /** Candidate TaskArgument labels; extract keeps the visible non-decoy one. */
  taskArgument: string;
  /** Post-answer confirm (`#submit` / Submit Selection). */
  confirmControl: string;
};

/**
 * Sample-backed selectors for BLS GenerateCaptcha iframe content.
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
