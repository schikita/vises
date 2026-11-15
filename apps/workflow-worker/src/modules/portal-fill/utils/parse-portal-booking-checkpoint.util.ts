import type { PortalBookingCheckpoint } from '../types/portal-booking-checkpoint.types';
import { isPortalBookingCheckpointOutcome } from './is-portal-booking-checkpoint-outcome.util';
import { isPortalBookingCheckpointStep } from './is-portal-booking-checkpoint-step.util';
import { isPortalBookingCheckpointStuckCode } from './is-portal-booking-checkpoint-stuck-code.util';
import { parsePortalBookingFieldProgress } from './parse-portal-booking-field-progress.util';

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

/**
 * Parse durable BOOK checkpoint jsonb. Returns null when structure is unusable.
 * Allowlisted keys only — strips email HTML, tokens, CRM values (CON-003 / NFR-002).
 */
export const parsePortalBookingCheckpoint = (
  raw: Record<string, unknown> | null | undefined,
): PortalBookingCheckpoint | null => {
  if (raw == null || typeof raw !== 'object' || Array.isArray(raw)) {
    return null;
  }

  if (
    !isNonEmptyString(raw.lastCompletedStep) ||
    !isPortalBookingCheckpointStep(raw.lastCompletedStep)
  ) {
    return null;
  }

  if (typeof raw.dataProtectionConsentDone !== 'boolean') {
    return null;
  }

  const checkpoint: PortalBookingCheckpoint = {
    lastCompletedStep: raw.lastCompletedStep,
    dataProtectionConsentDone: raw.dataProtectionConsentDone,
  };

  if (isNonEmptyString(raw.dataProtectionMessageId)) {
    checkpoint.dataProtectionMessageId = raw.dataProtectionMessageId.trim();
  }

  const bookingFieldProgress = parsePortalBookingFieldProgress(
    raw.bookingFieldProgress,
  );
  if (bookingFieldProgress !== undefined) {
    checkpoint.bookingFieldProgress = bookingFieldProgress;
  }

  if (
    isNonEmptyString(raw.lastOutcome) &&
    isPortalBookingCheckpointOutcome(raw.lastOutcome)
  ) {
    checkpoint.lastOutcome = raw.lastOutcome;
  }

  if (
    isNonEmptyString(raw.stuckCode) &&
    isPortalBookingCheckpointStuckCode(raw.stuckCode)
  ) {
    checkpoint.stuckCode = raw.stuckCode;
  }

  return checkpoint;
};
