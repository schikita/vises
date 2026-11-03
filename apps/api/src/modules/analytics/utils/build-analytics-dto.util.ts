import type {
  AnalyticsClientsPerAgentDto,
  AnalyticsDto,
  AnalyticsPerAgentDto,
} from '@vises/contracts';
import { buildPaginatedList } from '../../../shared/utils';
import type { BuildAnalyticsDtoInput } from '../types';
import { agentMatchesAnalyticsQ } from './agent-matches-analytics-q.util';
import { buildStatusBuckets } from './build-status-buckets.util';
import { countFactsByStatus } from './count-facts-by-status.util';
import { filterFactsByReceivedAt } from './filter-facts-by-received-at.util';
import { formatPercentage } from './format-percentage.util';

/**
 * Assemble AnalyticsDto per §6.7.1 / AC-15 / AC-15a / AC-15b / AC-16 / DEC-P2 / DEC-P15.
 * Status series use history-derived facts; clients-per-agent ignores date range.
 * `perAgent` is sorted by client count descending (tie-break agentId), optionally
 * filtered by `agentQ`, then paginated. `clientsPerAgent` + `global` stay unfiltered by q.
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

  const statusFacts = filterFactsByReceivedAt(
    scopedFacts,
    input.dateRange,
  );

  const globalCounts = countFactsByStatus(statusFacts);
  const globalTotal = statusFacts.length;

  const clientCounts = new Map<string, number>();
  for (const row of scopedClients) {
    clientCounts.set(row.agentId, (clientCounts.get(row.agentId) ?? 0) + 1);
  }
  const totalClients = scopedClients.length;

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

  const clientsPerAgent: AnalyticsClientsPerAgentDto[] = [...clientCounts.keys()]
    .sort((a, b): number => a.localeCompare(b))
    .map((agentId): AnalyticsClientsPerAgentDto => {
      const count = clientCounts.get(agentId) ?? 0;
      return {
        agentId,
        count,
        percentage: formatPercentage(count, totalClients),
      };
    });

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
    clientsPerAgent,
  };
};
