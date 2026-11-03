import type {
  BalanceTransactionDto,
  BalanceTransactionsListDto,
} from '@vises/contracts';
import type { EntityManager } from 'typeorm';
import type { User } from '../../database/entities/user.entity';
import type { BalanceAdjustDto } from '../dto/balance-adjust.dto';
import type { BalanceTopUpDto } from '../dto/balance-top-up.dto';
import type {
  BalanceTransactionsQueryParsed,
  DebitWithLockInput,
} from '../types';

export interface IBalanceService {
  topUp(
    agentId: string,
    body: BalanceTopUpDto,
    actor: User,
  ): Promise<BalanceTransactionDto>;

  adjust(
    agentId: string,
    body: BalanceAdjustDto,
    actor: User,
  ): Promise<BalanceTransactionDto>;

  listTransactions(
    agentId: string,
    actor: User,
    query: BalanceTransactionsQueryParsed,
  ): Promise<BalanceTransactionsListDto>;

  /**
   * Row-locked debit for client create (AC-6a). Caller owns the transaction.
   */
  debitWithLock(
    manager: EntityManager,
    input: DebitWithLockInput,
  ): Promise<BalanceTransactionDto>;
}
