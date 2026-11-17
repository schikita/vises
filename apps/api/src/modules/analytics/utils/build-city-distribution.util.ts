import type { AnalyticsCityBucketDto } from '@vises/contracts';
import type { AnalyticsApplicationFact } from '../types';
import { formatPercentage } from './format-percentage.util';

/**
 * §5.1 city distribution over the selected period (DEC-ASAU-009).
 * Empty `submitCity` values are excluded (matches dashboard city stats).
 */
export const buildCityDistribution = (
  facts: AnalyticsApplicationFact[],
): AnalyticsCityBucketDto[] => {
  const counts = new Map<string, number>();
  for (const fact of facts) {
    const city = fact.submitCity.trim();
    if (city === '') {
      continue;
    }
    counts.set(city, (counts.get(city) ?? 0) + 1);
  }

  const total = [...counts.values()].reduce(
    (sum, n): number => sum + n,
    0,
  );

  return [...counts.keys()]
    .sort((a, b): number => a.localeCompare(b))
    .map((city): AnalyticsCityBucketDto => {
      const count = counts.get(city) ?? 0;
      return {
        city,
        count,
        percentage: formatPercentage(count, total),
      };
    });
};
