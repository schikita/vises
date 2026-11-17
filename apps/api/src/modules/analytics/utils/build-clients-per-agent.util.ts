import type { AnalyticsClientsPerAgentDto } from '@vises/contracts';
import type {
  AnalyticsAgentBalanceRow,
  AnalyticsApplicationFact,
  AnalyticsClientAgentRow,
} from '../types';
import { countPaidFacts } from './count-paid-facts.util';
import { formatPercentage } from './format-percentage.util';
import { sumPaidAmount } from './sum-paid-amount.util';

/**
 * Build `clientsPerAgent` rows (DEC-ASAU-003).
 *
 * - `periodScoped === false` (current totals): `registered`/`count` = Client rows;
 *   `paid` / `paidAmount` use all provided facts.
 * - `periodScoped === true`: rows come from period-filtered facts; `registered`/
 *   `count` = applications created in the period for that agent.
 * Balance comes from `agentBalances`; missing → `"0.00"`.
 */
export const buildClientsPerAgent = (
  clients: AnalyticsClientAgentRow[],
  facts: AnalyticsApplicationFact[],
  agentBalances: AnalyticsAgentBalanceRow[],
  periodScoped = false,
): AnalyticsClientsPerAgentDto[] => {
  const balanceByAgent = new Map<string, string>();
  for (const row of agentBalances) {
    balanceByAgent.set(row.agentId, row.balance);
  }

  const factsByAgent = new Map<string, AnalyticsApplicationFact[]>();
  for (const fact of facts) {
    const list = factsByAgent.get(fact.agentId);
    if (list) {
      list.push(fact);
    } else {
      factsByAgent.set(fact.agentId, [fact]);
    }
  }

  if (periodScoped) {
    const totalApps = facts.length;
    return [...factsByAgent.keys()]
      .sort((a, b): number => a.localeCompare(b))
      .map((agentId): AnalyticsClientsPerAgentDto => {
        const agentFacts = factsByAgent.get(agentId) ?? [];
        const count = agentFacts.length;
        return {
          agentId,
          count,
          percentage: formatPercentage(count, totalApps),
          balance: balanceByAgent.get(agentId) ?? '0.00',
          registered: count,
          paid: countPaidFacts(agentFacts),
          paidAmount: sumPaidAmount(agentFacts),
        };
      });
  }

  const clientCounts = new Map<string, number>();
  for (const row of clients) {
    clientCounts.set(row.agentId, (clientCounts.get(row.agentId) ?? 0) + 1);
  }
  const totalClients = clients.length;

  return [...clientCounts.keys()]
    .sort((a, b): number => a.localeCompare(b))
    .map((agentId): AnalyticsClientsPerAgentDto => {
      const count = clientCounts.get(agentId) ?? 0;
      const agentFacts = factsByAgent.get(agentId) ?? [];
      return {
        agentId,
        count,
        percentage: formatPercentage(count, totalClients),
        balance: balanceByAgent.get(agentId) ?? '0.00',
        registered: count,
        paid: countPaidFacts(agentFacts),
        paidAmount: sumPaidAmount(agentFacts),
      };
    });
};
