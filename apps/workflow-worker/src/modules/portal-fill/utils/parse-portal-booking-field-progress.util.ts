import type { PortalBookingFieldProgress } from '../types/portal-booking-checkpoint.types';
import { isPortalBookingFieldProgressStatus } from './is-portal-booking-field-progress-status.util';

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

/**
 * Parse `bookingFieldProgress` from jsonb — field ids + status codes only.
 * Drops unknown shapes and never keeps value-like payloads (NFR-002).
 */
export const parsePortalBookingFieldProgress = (
  raw: unknown,
): PortalBookingFieldProgress | undefined => {
  if (raw == null || typeof raw !== 'object' || Array.isArray(raw)) {
    return undefined;
  }

  const record = raw as Record<string, unknown>;
  const progress: PortalBookingFieldProgress = {};

  for (const [fieldId, status] of Object.entries(record)) {
    if (!isNonEmptyString(fieldId)) {
      continue;
    }
    if (typeof status !== 'string' || !isPortalBookingFieldProgressStatus(status)) {
      continue;
    }
    progress[fieldId.trim()] = status;
  }

  return Object.keys(progress).length > 0 ? progress : undefined;
};
