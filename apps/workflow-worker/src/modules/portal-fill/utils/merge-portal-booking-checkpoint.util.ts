import type {
  PortalBookingCheckpoint,
  PortalBookingCheckpointPatch,
} from '../types/portal-booking-checkpoint.types';

/**
 * Apply a pipeline patch onto the in-memory BOOK checkpoint bag.
 * Does not persist; never copies field values or secrets.
 */
export const mergePortalBookingCheckpoint = (
  current: PortalBookingCheckpoint,
  patch: PortalBookingCheckpointPatch,
): PortalBookingCheckpoint => {
  const next: PortalBookingCheckpoint = {
    ...current,
    bookingFieldProgress:
      patch.bookingFieldProgress !== undefined
        ? { ...patch.bookingFieldProgress }
        : current.bookingFieldProgress !== undefined
          ? { ...current.bookingFieldProgress }
          : undefined,
  };

  if (patch.lastCompletedStep !== undefined) {
    next.lastCompletedStep = patch.lastCompletedStep;
  }
  if (patch.dataProtectionConsentDone !== undefined) {
    next.dataProtectionConsentDone = patch.dataProtectionConsentDone;
  }
  if (patch.dataProtectionMessageId !== undefined) {
    next.dataProtectionMessageId = patch.dataProtectionMessageId;
  }
  if (patch.lastOutcome === null) {
    delete next.lastOutcome;
  } else if (patch.lastOutcome !== undefined) {
    next.lastOutcome = patch.lastOutcome;
  }
  if (patch.stuckCode === null) {
    delete next.stuckCode;
  } else if (patch.stuckCode !== undefined) {
    next.stuckCode = patch.stuckCode;
  }

  return next;
};
