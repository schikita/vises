import type { AgentTotalRevenueRow } from '../types/agent-total-revenue-row.types';
import { formatAgentTotalRevenue } from './format-agent-total-revenue.util';

/**
 * Build agentId → totalRevenue map from batched ledger aggregation (DEC-P13).
 * Missing agents default to `"0.00"`.
 */
export const buildAgentTotalRevenueMap = (
  agentIds: readonly string[],
  rows: readonly AgentTotalRevenueRow[],
): Map<string, string> => {
  const map = new Map<string, string>();
  for (const id of agentIds) {
    map.set(id, '0.00');
  }
  for (const row of rows) {
    map.set(row.agentId, formatAgentTotalRevenue(row.total));
  }
  return map;
};
