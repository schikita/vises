/**
 * Visa center monitor system actor + API-key header (FR-7.4 / AC-13 / plan pin).
 * Chosen header: `X-Visa-Center-Monitor-Key` (not Authorization Bearer).
 */
export const VISA_CENTER_MONITOR_ACTOR = 'visa_center_monitor' as const;

/** HTTP header name (canonical casing for docs / examples). */
export const VISA_CENTER_MONITOR_API_KEY_HEADER =
  'X-Visa-Center-Monitor-Key' as const;

/** Express/Node lower-cases incoming header names. */
export const VISA_CENTER_MONITOR_API_KEY_HEADER_LOWER =
  'x-visa-center-monitor-key' as const;

/** Default history trigger when monitor marks drafting → pending. */
export const VISA_CENTER_MONITOR_DEFAULT_TRIGGER =
  'visa_center_monitor_pending' as const;

/** Env key for the static monitor credential (empty ⇒ fail-closed 401). */
export const VISA_CENTER_MONITOR_API_KEY_ENV =
  'VISES_VISA_CENTER_MONITOR_API_KEY' as const;
