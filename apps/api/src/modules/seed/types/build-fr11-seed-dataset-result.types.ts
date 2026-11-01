import type { ApplicationStatusHistory } from '../../database/entities/application-status-history.entity';
import type { Application } from '../../database/entities/application.entity';
import type { BalanceTransaction } from '../../database/entities/balance-transaction.entity';
import type { Client } from '../../database/entities/client.entity';

export type BuildFr11SeedDatasetResult = {
  clients: Client[];
  applications: Application[];
  history: ApplicationStatusHistory[];
  ledger: BalanceTransaction[];
};
