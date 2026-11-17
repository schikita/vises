import type { AnalyticsPaymentCompletenessDto } from '@vises/contracts';
import type { AnalyticsApplicationFact } from '../types';
import { countPaidFacts } from './count-paid-facts.util';
import { formatPercentage } from './format-percentage.util';

/**
 * §5.1 payment completeness KPI over the selected period (DEC-ASAU-009).
 */
export const buildPaymentCompleteness = (
  facts: AnalyticsApplicationFact[],
): AnalyticsPaymentCompletenessDto => {
  const totalApplications = facts.length;
  const paidCount = countPaidFacts(facts);
  return {
    totalApplications,
    paidCount,
    completenessPercentage: formatPercentage(paidCount, totalApplications),
  };
};
