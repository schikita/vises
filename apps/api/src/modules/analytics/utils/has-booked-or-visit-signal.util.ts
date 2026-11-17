import type { AnalyticsApplicationFact } from '../types';

/**
 * §5.1 booked signal: effective status `booked` or non-empty visitDate.
 */
export const hasBookedOrVisitSignal = (
  fact: AnalyticsApplicationFact,
): boolean => {
  if (fact.effectiveStatus === 'booked') {
    return true;
  }
  return fact.visitDate.trim() !== '';
};
