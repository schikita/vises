import type { AnalyticsHistoryEvent } from '../types';

/**
 * `receivedAt` = first drafting → pending transition (§6.7.1).
 */
export const resolveReceivedAt = (
  eventsAsc: AnalyticsHistoryEvent[],
): Date | null => {
  for (const event of eventsAsc) {
    if (event.fromStatus === 'drafting' && event.toStatus === 'pending') {
      return event.createdAt;
    }
  }
  return null;
};
