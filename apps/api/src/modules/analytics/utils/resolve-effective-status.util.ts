import type { ApplicationStatus } from '@vises/contracts';
import type { AnalyticsHistoryEvent } from '../types';

/**
 * Effective status from history only (AC-16).
 * No history → `drafting` (app created in drafting without a transition).
 */
export const resolveEffectiveStatus = (
  eventsAsc: AnalyticsHistoryEvent[],
): ApplicationStatus => {
  const last = eventsAsc[eventsAsc.length - 1];
  if (last === undefined) {
    return 'drafting';
  }
  return last.toStatus;
};
