import { PORTAL_BOOKING_CHECKPOINT_STEP } from '../constants/portal-booking-checkpoint-step.constants';
import type { PortalBookingCheckpoint } from '../types/portal-booking-checkpoint.types';

/** Seed BOOK checkpoint before data-protection consent / booking entry. */
export const createInitialPortalBookingCheckpoint =
  (): PortalBookingCheckpoint => ({
    lastCompletedStep: PORTAL_BOOKING_CHECKPOINT_STEP.READY_TO_BOOK,
    dataProtectionConsentDone: false,
  });
