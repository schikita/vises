import type { AnalyticsHistoryEvent } from '../types';

/**
 * BUSINESS `receivedAt` proxy (FR-15 spirit). Not the date-filter dimension —
 * range queries use `bookedAt` (`AnalyticsDateFilterDimension`).
 *
 * Rule (aligned with intake into the staff workflow):
 * 1. Prefer first transition TO `not_ready_for_appointment` (typically from
 *    `draft`|`filling` per §4.C).
 * 2. Else use the earliest history timestamp as a create / first-history proxy
 *    when that intake transition never occurred.
 * 3. Empty history → null.
 */
export const resolveReceivedAt = (
  eventsAsc: AnalyticsHistoryEvent[],
): Date | null => {
  for (const event of eventsAsc) {
    if (event.toStatus === 'not_ready_for_appointment') {
      return event.createdAt;
    }
  }
  const first = eventsAsc[0];
  if (first === undefined) {
    return null;
  }
  return first.createdAt;
};
