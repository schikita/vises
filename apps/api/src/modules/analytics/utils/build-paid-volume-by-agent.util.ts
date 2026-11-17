import type { AnalyticsPaidVolumeAgentDto } from '@vises/contracts';
import type { AnalyticsApplicationFact } from '../types';
import { formatWholeUnitsMoney } from './format-whole-units-money.util';

/**
 * §5.1 agent paid-volume leaderboard over the selected period (DEC-ASAU-009).
 * Only agents with at least one paid application are included.
 */
export const buildPaidVolumeByAgent = (
  facts: AnalyticsApplicationFact[],
): AnalyticsPaidVolumeAgentDto[] => {
  const byAgent = new Map<string, { paidCount: number; paidAmount: number }>();

  for (const fact of facts) {
    if (!fact.paymentPaid) {
      continue;
    }
    const current = byAgent.get(fact.agentId) ?? {
      paidCount: 0,
      paidAmount: 0,
    };
    current.paidCount += 1;
    current.paidAmount += fact.paymentAmount;
    byAgent.set(fact.agentId, current);
  }

  return [...byAgent.keys()]
    .sort((a, b): number => a.localeCompare(b))
    .map((agentId): AnalyticsPaidVolumeAgentDto => {
      const row = byAgent.get(agentId) ?? { paidCount: 0, paidAmount: 0 };
      return {
        agentId,
        paidCount: row.paidCount,
        paidAmount: formatWholeUnitsMoney(row.paidAmount),
      };
    });
};
