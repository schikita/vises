import type { PiiEncryptedFieldMap } from '../../pii';
import type { AppFactory } from './app-factory.types';
import type { BalanceFactory } from './balance-factory.types';
import type { ClientFactory } from './client-factory.types';
import type { HistoryFactory } from './history-factory.types';
import type { SeedAgentPlan } from './seed-agent-plan.types';

export type BuildFr11SeedDatasetInput = {
  applications: AppFactory;
  clients: ClientFactory;
  history: HistoryFactory;
  ledger: BalanceFactory;
  superadminId: string;
  agentPlans: readonly SeedAgentPlan[];
  now: Date;
  /** Encrypt FR-6 passport field map (identity OK in pure unit tests). */
  encryptFields: (fields: PiiEncryptedFieldMap) => PiiEncryptedFieldMap;
};
