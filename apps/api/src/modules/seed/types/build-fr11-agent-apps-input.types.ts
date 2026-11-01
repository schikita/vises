import type { ApplicationStatus } from '@vises/contracts';
import type { PiiEncryptedFieldMap } from '../../pii';
import type { AppFactory } from './app-factory.types';
import type { ClientFactory } from './client-factory.types';
import type { HistoryFactory } from './history-factory.types';

export type BuildFr11AgentAppsInput = {
  applications: AppFactory;
  clients: ClientFactory;
  history: HistoryFactory;
  agentId: string;
  agentName: string;
  agentKey: 'a' | 'b';
  statuses: readonly ApplicationStatus[];
  now: Date;
  encryptFields: (fields: PiiEncryptedFieldMap) => PiiEncryptedFieldMap;
  rngSeedOffset: number;
};
