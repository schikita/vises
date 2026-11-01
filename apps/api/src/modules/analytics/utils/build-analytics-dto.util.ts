import type {
  AnalyticsClientsPerAgentDto,
  AnalyticsDto,
  AnalyticsPerAgentDto,
} from '@vises/contracts';
import type { BuildAnalyticsDtoInput } from '../types';
import { buildStatusBuckets } from './build-status-buckets.util';
import { countFactsByStatus } from './count-facts-by-status.util';
import { filterFactsByReceivedAt } from './filter-facts-by-received-at.util';
import { formatPercentage } from './format-percentage.util';

/**
 * Assemble AnalyticsDto per §6.7.1 / AC-15 / AC-15a / AC-15b / AC-16.
 * Status series use history-derived facts; clients-per-agent ignores date range.
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

  const agentIds = new Set<string>();
  for (const fact of statusFacts) {
    agentIds.add(fact.agentId);
  }

  const perAgent: AnalyticsPerAgentDto[] = [...agentIds]
    .sort((a, b): number => a.localeCompare(b))
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

  const clientCounts = new Map<string, number>();
  for (const row of scopedClients) {
    clientCounts.set(row.agentId, (clientCounts.get(row.agentId) ?? 0) + 1);
  }
  const totalClients = scopedClients.length;

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
    perAgent,
    global: {
      totalApplications: globalTotal,
      byStatus: buildStatusBuckets(globalCounts, globalTotal),
    },
    clientsPerAgent,
  };
};
