import type {
  AnalyticsDto,
  AnalyticsPerAgentDto,
} from '@vises/contracts';
import type { BuildAnalyticsDtoInput } from '../types';
import { buildBookedVsUnpaid } from './build-booked-vs-unpaid.util';
import { buildCityDistribution } from './build-city-distribution.util';
import { buildClientsPerAgent } from './build-clients-per-agent.util';
import { buildPaidVolumeByAgent } from './build-paid-volume-by-agent.util';
import { buildPaymentCompleteness } from './build-payment-completeness.util';
import { buildStatusBuckets } from './build-status-buckets.util';
import { countFactsByStatus } from './count-facts-by-status.util';
import { filterFactsByCreatedAt } from './filter-facts-by-created-at.util';

/**
 * Assemble AnalyticsDto per §6.7.1 / AC-15 / DEC-ASAU-003 / DEC-ASAU-009.
 * Status series, §5.1 aggregates, and `clientsPerAgent` use facts filtered by
 * application `createdAt` when a date range is set.
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

  return {
    perAgent,
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
