import type { ApplicationStatus } from '@vises/contracts';
import type { AnalyticsApplicationFact } from '../types';

export const countFactsByStatus = (
  facts: AnalyticsApplicationFact[],
): Map<ApplicationStatus, number> => {
  const counts = new Map<ApplicationStatus, number>();
  for (const fact of facts) {
    counts.set(
      fact.effectiveStatus,
      (counts.get(fact.effectiveStatus) ?? 0) + 1,
    );
  }
  return counts;
};
