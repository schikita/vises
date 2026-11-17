import type { AnalyticsDto, AnalyticsPerAgentDto } from '@vises/contracts';
import { buildPaginatedList } from '../../../shared/utils';
import type { BuildAnalyticsDtoInput } from '../types';
import { agentMatchesAnalyticsQ } from './agent-matches-analytics-q.util';
import { buildBookedVsUnpaid } from './build-booked-vs-unpaid.util';
import { buildCityDistribution } from './build-city-distribution.util';
import { buildClientsPerAgent } from './build-clients-per-agent.util';
import { buildPaidVolumeByAgent } from './build-paid-volume-by-agent.util';
import { buildPaymentCompleteness } from './build-payment-completeness.util';
import { buildStatusBuckets } from './build-status-buckets.util';
import { countFactsByStatus } from './count-facts-by-status.util';
import { filterFactsByCreatedAt } from './filter-facts-by-created-at.util';

/**
 * Assemble AnalyticsDto per §6.7.1 / AC-15 / DEC-ASAU-003 / DEC-ASAU-009 /
 * DEC-P2 / DEC-P15.
 * Status series, §5.1 aggregates, and `clientsPerAgent` use facts filtered by
 * application `createdAt` when a date range is set.
 * `perAgent` is sorted by client count descending (tie-break agentId), optionally
 * filtered by `agentQ`, then paginated. `clientsPerAgent` + `global` stay unfiltered by q.
 * Agent scope restricts all series to self; balances never leak other agents.
 */
export const buildAnalyticsDto = (
  input: BuildAnalyticsDtoInput,
): AnalyticsDto => {
  const scopedFacts =
    input.agentScopeId === null
      ? input.facts
      : input.facts.filter(
          (fact): boolean => fact.agentId === input.agentScopeId,
        );

  const scopedClients =
    input.agentScopeId === null
      ? input.clients
      : input.clients.filter(
          (row): boolean => row.agentId === input.agentScopeId,
        );

  const scopedBalances =
    input.agentScopeId === null
      ? input.agentBalances
      : input.agentBalances.filter(
          (row): boolean => row.agentId === input.agentScopeId,
        );

  const statusFacts = filterFactsByCreatedAt(scopedFacts, input.dateRange);
  const periodScoped = input.dateRange !== null;

  const globalCounts = countFactsByStatus(statusFacts);
  const globalTotal = statusFacts.length;

  const clientCounts = new Map<string, number>();
  for (const row of scopedClients) {
    clientCounts.set(row.agentId, (clientCounts.get(row.agentId) ?? 0) + 1);
  }

  const agentIds = new Set<string>();
  for (const fact of statusFacts) {
    agentIds.add(fact.agentId);
  }

  const perAgentAll: AnalyticsPerAgentDto[] = [...agentIds]
    .filter((agentId): boolean =>
      agentMatchesAnalyticsQ(agentId, input.agentQ, input.agentsById),
    )
    .sort((a, b): number => {
      const countDiff =
        (clientCounts.get(b) ?? 0) - (clientCounts.get(a) ?? 0);
      if (countDiff !== 0) {
        return countDiff;
      }
      return a.localeCompare(b);
    })
    .map((agentId): AnalyticsPerAgentDto => {
      const agentFacts = statusFacts.filter(
        (fact): boolean => fact.agentId === agentId,
      );
      const totalApplications = agentFacts.length;
      return {
        agentId,
        totalApplications,
        byStatus: buildStatusBuckets(
          countFactsByStatus(agentFacts),
          totalApplications,
        ),
      };
    });

  const { page, pageSize } = input.pagination;
  const start = (page - 1) * pageSize;
  const perAgentPage = perAgentAll.slice(start, start + pageSize);

  return {
    perAgent: buildPaginatedList({
      items: perAgentPage,
      total: perAgentAll.length,
      page,
      pageSize,
    }),
    global: {
      totalApplications: globalTotal,
      byStatus: buildStatusBuckets(globalCounts, globalTotal),
    },
    clientsPerAgent: buildClientsPerAgent(
      scopedClients,
      statusFacts,
      scopedBalances,
      periodScoped,
    ),
    bookedVsUnpaid: buildBookedVsUnpaid(statusFacts),
    cityDistribution: buildCityDistribution(statusFacts),
    paymentCompleteness: buildPaymentCompleteness(statusFacts),
    paidVolumeByAgent: buildPaidVolumeByAgent(statusFacts),
  };
};
