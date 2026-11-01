import type { BalanceFactory } from './balance-factory.types';

export type BuildAgentSeedLedgerInput = {
  ledger: BalanceFactory;
  agentId: string;
  /** Actor for the seed top_up row (typically superadmin). */
  topUpActorId: string;
  topUpAmountWhole: number;
  clientIds: readonly string[];
  idPrefix: string;
  baseTime: Date;
};
