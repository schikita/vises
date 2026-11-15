import { PORTAL_BOOKING_FIELD_PROGRESS_STATUS } from '../constants/portal-booking-field-progress-status.constants';
import type { PortalBookingFieldProgressStatus } from '../types/portal-booking-checkpoint.types';

const STATUS_VALUES = new Set<string>(
  Object.values(PORTAL_BOOKING_FIELD_PROGRESS_STATUS),
);

export const isPortalBookingFieldProgressStatus = (
  value: string,
): value is PortalBookingFieldProgressStatus => STATUS_VALUES.has(value);
