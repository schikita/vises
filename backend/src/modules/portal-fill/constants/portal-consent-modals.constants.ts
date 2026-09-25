/**
 * Consent / attention modal dismissal (DEC-002, DEC-004).
 * Prefer stable ids / onclick / success+dismiss over full English labels.
 *
 * Live portal shows modals one-by-one with noticeable gaps after each accept
 * (ISSUE-002). Presence + inter-step delay must cover that lag.
 */

export const CONSENT_MODAL_STEP_IDS = [
  'alertModal',
  'dpModal',
  'Attention',
] as const;

/** Cap per modal step budget (DEC-004; raised for delayed live modals). */
export const CONSENT_MODAL_STEP_BUDGET_CAP_MS = 12_000;

/**
 * Cap for presence/shown detection window within a step (DEC-004).
 * Must cover the gap between sequential portal modals (ISSUE-002).
 */
export const CONSENT_MODAL_PRESENCE_WINDOW_CAP_MS = 8_000;

/** Poll interval while waiting for modal presence / hide. */
export const CONSENT_MODAL_POLL_INTERVAL_MS = 100;

/**
 * After a modal is shown, brief settle before accept click
 * (Bootstrap fade / backdrop handoff).
 */
export const CONSENT_MODAL_SHOWN_SETTLE_MS = 400;

/**
 * Pause after each step before looking for the next modal
 * (portal schedules subsequent dialogs with a delay).
 */
export const CONSENT_MODAL_INTER_STEP_DELAY_MS = 1_500;

export const CONSENT_MODAL_ALERT_ROOT_SELECTOR = '#alertModal';
export const CONSENT_MODAL_DP_ROOT_SELECTOR = '#dpModal';

/** Prefer accept buttons whose onclick invokes these portal handlers. */
export const CONSENT_MODAL_ALERT_ONCLICK_SUBSTRING = 'onBioDisclaimerAccept';
/** Live portal handler name is `onDdAccept` (not onDpAccept). */
export const CONSENT_MODAL_DP_ONCLICK_SUBSTRING = 'onDdAccept';

/** Attention title cue (span.text-danger or equivalent title text). */
export const CONSENT_MODAL_ATTENTION_TITLE_TEXT = 'Attention';

/** Accept control text for Attention modal (normalized trim / starts-with). */
export const CONSENT_MODAL_ATTENTION_ACCEPT_TEXT = 'Accept';

