import { PORTAL_BOOKING_CHECKPOINT_STEP } from '../constants/portal-booking-checkpoint-step.constants';
import type { PortalBookingCheckpointStep } from '../types/portal-booking-checkpoint.types';

const STEP_VALUES = new Set<string>(
  Object.values(PORTAL_BOOKING_CHECKPOINT_STEP),
);

export const isPortalBookingCheckpointStep = (
  value: string,
): value is PortalBookingCheckpointStep => STEP_VALUES.has(value);
