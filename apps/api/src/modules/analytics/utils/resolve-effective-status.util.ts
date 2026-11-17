import type { ApplicationStatus } from '@vises/contracts';
import type { AnalyticsHistoryEvent } from '../types';

/**
 * Effective status from history only (AC-16 / FR-15).
 * No history → `draft` (BUSINESS create default; never legacy `drafting`).
 */
export const resolveEffectiveStatus = (
  eventsAsc: AnalyticsHistoryEvent[],
): ApplicationStatus => {
  const last = eventsAsc[eventsAsc.length - 1];
  if (last === undefined) {
    return 'draft';
  }
  return last.toStatus;
};
