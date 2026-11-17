import type { AnalyticsBookedVsUnpaidDto } from '@vises/contracts';
import type { AnalyticsApplicationFact } from '../types';
import { hasBookedOrVisitSignal } from './has-booked-or-visit-signal.util';

/**
 * §5.1 booked visits vs unpaid apps over the selected period (DEC-ASAU-009).
 */
export const buildBookedVsUnpaid = (
  facts: AnalyticsApplicationFact[],
): AnalyticsBookedVsUnpaidDto => {
  let bookedCount = 0;
  let unpaidCount = 0;
  for (const fact of facts) {
    if (hasBookedOrVisitSignal(fact)) {
      bookedCount += 1;
    }
    if (!fact.paymentPaid) {
      unpaidCount += 1;
    }
  }
  return { bookedCount, unpaidCount };
};
