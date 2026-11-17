import type { AnalyticsHistoryEvent } from '../types';

/**
 * `bookedAt` = timestamp of the first history transition into `booked` (FR-15).
 * Replaces removed `issuedAt` (was first `booked` → `issued`).
 * Date-range analytics filter on this dimension only — never on `issuedAt`.
 */
export const resolveBookedAt = (
  eventsAsc: AnalyticsHistoryEvent[],
): Date | null => {
  for (const event of eventsAsc) {
    if (event.toStatus === 'booked') {
      return event.createdAt;
    }
  }
  return null;
};
