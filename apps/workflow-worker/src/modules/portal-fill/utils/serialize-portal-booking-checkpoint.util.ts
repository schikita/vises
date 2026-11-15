import type { PortalBookingCheckpoint } from '../types/portal-booking-checkpoint.types';

/**
 * Serialize BOOK checkpoint for jsonb — allowlisted keys only.
 * Never writes field values, email HTML, or consent `data=` tokens.
 */
export const serializePortalBookingCheckpoint = (
  checkpoint: PortalBookingCheckpoint,
): Record<string, unknown> => {
  const json: Record<string, unknown> = {
    lastCompletedStep: checkpoint.lastCompletedStep,
    dataProtectionConsentDone: checkpoint.dataProtectionConsentDone,
  };

  if (checkpoint.dataProtectionMessageId !== undefined) {
    json.dataProtectionMessageId = checkpoint.dataProtectionMessageId;
  }

  if (checkpoint.bookingFieldProgress !== undefined) {
    json.bookingFieldProgress = { ...checkpoint.bookingFieldProgress };
  }

  if (checkpoint.lastOutcome !== undefined) {
    json.lastOutcome = checkpoint.lastOutcome;
  }

  if (checkpoint.stuckCode !== undefined) {
    json.stuckCode = checkpoint.stuckCode;
  }

  return json;
};
