import type { AnalyticsApplicationFact } from '../types';

/** Count facts with `paymentPaid === true` (DEC-ASAU-003 / REQ-008). */
export const countPaidFacts = (facts: AnalyticsApplicationFact[]): number => {
  let count = 0;
  for (const fact of facts) {
    if (fact.paymentPaid) {
      count += 1;
    }
  }
  return count;
};
