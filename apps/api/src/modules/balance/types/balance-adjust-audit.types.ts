/**
 * Winston audit payload for manual balance adjust (NFR-4).
 * No unnecessary PII — ids, amount, reason, timestamp only.
 */
export type BalanceAdjustAuditPayload = {
  type: 'balance_adjust';
  actorId: string;
  targetAgentId: string;
  amount: string;
  reason: string;
  resultingBalance: string;
  timestamp: string;
};
