import { PORTAL_BOOKING_CHECKPOINT_STUCK_CODE } from '../constants/portal-booking-checkpoint-stuck-code.constants';
import type { PortalBookingCheckpointStuckCode } from '../types/portal-booking-checkpoint.types';

const STUCK_CODE_VALUES = new Set<string>(
  Object.values(PORTAL_BOOKING_CHECKPOINT_STUCK_CODE),
);

export const isPortalBookingCheckpointStuckCode = (
  value: string,
): value is PortalBookingCheckpointStuckCode => STUCK_CODE_VALUES.has(value);
