import type { BalanceTransaction } from '../../database/entities/balance-transaction.entity';

export type BalanceFactory = {
  create: (data: Partial<BalanceTransaction>) => BalanceTransaction;
};
