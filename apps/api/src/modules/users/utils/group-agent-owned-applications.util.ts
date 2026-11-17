import type { AgentOwnedApplicationRow } from '../types/agent-owned-application-row.types';

/**
 * Group agent-owned application rows by `agentId` for latestAppId resolution.
 */
export const groupAgentOwnedApplications = (
  rows: readonly AgentOwnedApplicationRow[],
): Map<string, AgentOwnedApplicationRow[]> => {
  const byAgentId = new Map<string, AgentOwnedApplicationRow[]>();
  for (const row of rows) {
    const existing = byAgentId.get(row.agentId);
    if (existing) {
      existing.push(row);
    } else {
      byAgentId.set(row.agentId, [row]);
    }
  }
  return byAgentId;
};
