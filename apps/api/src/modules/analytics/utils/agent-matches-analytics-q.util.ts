import type { AnalyticsAgentLookup } from '../types/analytics-agent-lookup.types';

/**
 * Case-insensitive contains match on agent id / login / name (DEC-P15).
 * Empty `q` matches everything.
 */
export const agentMatchesAnalyticsQ = (
  agentId: string,
  q: string,
  agentsById: ReadonlyMap<string, AnalyticsAgentLookup>,
): boolean => {
  const needle = q.trim().toLowerCase();
  if (needle === '') {
    return true;
  }
  if (agentId.toLowerCase().includes(needle)) {
    return true;
  }
  const agent = agentsById.get(agentId);
  if (!agent) {
    return false;
  }
  return (
    agent.login.toLowerCase().includes(needle) ||
    agent.name.toLowerCase().includes(needle)
  );
};
