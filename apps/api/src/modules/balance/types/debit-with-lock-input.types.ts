/**
 * Input for row-locked client-creation debit (AC-6a / FR-4).
 * `amount` is a positive decimal string to deduct (NFR-1).
 */
export type DebitWithLockInput = {
  agentId: string;
  actorId: string;
  amount: string;
  clientId: string;
  reason: string;
};
