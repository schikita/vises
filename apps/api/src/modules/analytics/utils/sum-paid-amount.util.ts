import type { AnalyticsApplicationFact } from '../types';
import { formatWholeUnitsMoney } from './format-whole-units-money.util';

/**
 * Sum `paymentAmount` for facts with `paymentPaid === true` (DEC-ASAU-003).
 * Returns a scale-2 decimal string.
 */
export const sumPaidAmount = (facts: AnalyticsApplicationFact[]): string => {
  let total = 0;
  for (const fact of facts) {
    if (fact.paymentPaid) {
      total += fact.paymentAmount;
    }
  }
  return formatWholeUnitsMoney(total);
};
