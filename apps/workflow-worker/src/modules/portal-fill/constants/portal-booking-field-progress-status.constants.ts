/**
 * Per-field progress status codes for booking checkpoint
 * `bookingFieldProgress` — status only, never field values (NFR-002).
 */
export const PORTAL_BOOKING_FIELD_PROGRESS_STATUS = {
  FILLED: 'filled',
  SKIPPED: 'skipped',
  FAILED: 'failed',
} as const;
