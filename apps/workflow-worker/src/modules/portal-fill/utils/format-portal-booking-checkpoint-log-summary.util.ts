import type { PortalBookingCheckpoint } from '../types/portal-booking-checkpoint.types';

/**
 * Safe log line for BOOK checkpoint persist
 * (step / flags / codes only — no field values or email bodies).
 */
export const formatPortalBookingCheckpointLogSummary = (
  checkpoint: PortalBookingCheckpoint,
): string => {
  const progressCount =
    checkpoint.bookingFieldProgress !== undefined
      ? Object.keys(checkpoint.bookingFieldProgress).length
      : 0;

  return [
    `step=${checkpoint.lastCompletedStep}`,
    `dataProtectionConsentDone=${checkpoint.dataProtectionConsentDone}`,
    checkpoint.dataProtectionMessageId !== undefined
      ? `dataProtectionMessageId=${checkpoint.dataProtectionMessageId}`
      : null,
    progressCount > 0 ? `bookingFieldProgressCount=${progressCount}` : null,
    checkpoint.lastOutcome !== undefined
      ? `lastOutcome=${checkpoint.lastOutcome}`
      : null,
    checkpoint.stuckCode !== undefined
      ? `stuckCode=${checkpoint.stuckCode}`
      : null,
  ]
    .filter((part): part is string => part != null)
    .join(' ');
};
