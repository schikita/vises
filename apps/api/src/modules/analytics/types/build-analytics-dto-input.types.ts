import type { AnalyticsApplicationFact } from './analytics-application-fact.types';
import type { AnalyticsClientAgentRow } from './analytics-client-agent-row.types';
import type { AnalyticsDateRange } from './analytics-date-range.types';

export type BuildAnalyticsDtoInput = {
  facts: AnalyticsApplicationFact[];
  clients: AnalyticsClientAgentRow[];
  /** When set, restrict all series to this agent (agent self-scope). */
  agentScopeId: string | null;
  /** Null = current totals (ignore dates). */
  dateRange: AnalyticsDateRange | null;
};
