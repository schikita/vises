import { BALANCE_ADJUST_AUDIT_EVENT_TYPE } from '../constants';
import type { BalanceAdjustAuditPayload } from '../types';

/**
 * Build Winston audit payload for a manual balance adjust (NFR-4).
 */
export const buildBalanceAdjustAuditPayload = (params: {
  actorId: string;
  targetAgentId: string;
  amount: string;
  reason: string;
  resultingBalance: string;
  timestamp?: Date;
}): BalanceAdjustAuditPayload => {
  const timestamp = params.timestamp ?? new Date();
  return {
    type: BALANCE_ADJUST_AUDIT_EVENT_TYPE,
    actorId: params.actorId,
    targetAgentId: params.targetAgentId,
    amount: params.amount,
    reason: params.reason,
    resultingBalance: params.resultingBalance,
    timestamp: timestamp.toISOString(),
  };
};
