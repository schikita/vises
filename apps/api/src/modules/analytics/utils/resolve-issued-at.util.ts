import type { AnalyticsHistoryEvent } from '../types';

/**
 * `issuedAt` = first booked → issued transition (§6.7.1).
 */
export const resolveIssuedAt = (
  eventsAsc: AnalyticsHistoryEvent[],
): Date | null => {
  for (const event of eventsAsc) {
    if (event.fromStatus === 'booked' && event.toStatus === 'issued') {
      return event.createdAt;
    }
  }
  return null;
};
