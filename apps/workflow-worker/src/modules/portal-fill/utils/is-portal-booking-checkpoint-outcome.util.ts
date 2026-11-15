import { PORTAL_BOOKING_CHECKPOINT_OUTCOME } from '../constants/portal-booking-checkpoint-outcome.constants';
import type { PortalBookingCheckpointOutcome } from '../types/portal-booking-checkpoint.types';

const OUTCOME_VALUES = new Set<string>(
  Object.values(PORTAL_BOOKING_CHECKPOINT_OUTCOME),
);

export const isPortalBookingCheckpointOutcome = (
  value: string,
): value is PortalBookingCheckpointOutcome => OUTCOME_VALUES.has(value);
