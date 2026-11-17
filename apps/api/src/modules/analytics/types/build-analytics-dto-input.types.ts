import type { AnalyticsAgentBalanceRow } from './analytics-agent-balance-row.types';
import type { AnalyticsAgentLookup } from './analytics-agent-lookup.types';
import type { AnalyticsApplicationFact } from './analytics-application-fact.types';
import type { AnalyticsClientAgentRow } from './analytics-client-agent-row.types';
import type { AnalyticsDateRange } from './analytics-date-range.types';
import type { AnalyticsPagination } from './analytics-pagination.types';

export type BuildAnalyticsDtoInput = {
  facts: AnalyticsApplicationFact[];
  clients: AnalyticsClientAgentRow[];
  /** Agent `User.balance` rows (admin: all agents; agent scope: self only). */
  agentBalances: AnalyticsAgentBalanceRow[];
  /** When set, restrict all series to this agent (agent self-scope). */
  agentScopeId: string | null;
  /** Null = current totals (ignore dates). */
  dateRange: AnalyticsDateRange | null;
  /** Paginates only `perAgent` (DEC-P2). */
  pagination: AnalyticsPagination;
  /** Optional agent search for `perAgent` only (DEC-P15). */
  agentQ: string;
  /** Lookup for agent id/login/name when filtering by `agentQ`. */
  agentsById: ReadonlyMap<string, AnalyticsAgentLookup>;
};
