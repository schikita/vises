/**
 * Aggregate fill counts from `field_progress_json` or report summary (REQ-004 / REQ-007).
 * No field values or secrets.
 */
export type PortalFieldProgressSummary = {
  filled: number;
  skipped: number;
  failed: number;
};
