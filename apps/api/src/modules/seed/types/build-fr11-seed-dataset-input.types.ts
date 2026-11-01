import type { PiiEncryptedFieldMap } from '../../pii';
import type { AppFactory } from './app-factory.types';
import type { BalanceFactory } from './balance-factory.types';
import type { ClientFactory } from './client-factory.types';
import type { HistoryFactory } from './history-factory.types';

export type BuildFr11SeedDatasetInput = {
  applications: AppFactory;
  clients: ClientFactory;
  history: HistoryFactory;
  ledger: BalanceFactory;
  superadminId: string;
  agentAId: string;
  agentBId: string;
  agentAName: string;
  agentBName: string;
  now: Date;
  /** Encrypt FR-6 passport field map (identity OK in pure unit tests). */
  encryptFields: (fields: PiiEncryptedFieldMap) => PiiEncryptedFieldMap;
};
