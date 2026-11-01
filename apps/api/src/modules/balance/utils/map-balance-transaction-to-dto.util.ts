import type { BalanceTransactionDto } from '@vises/contracts';
import { formatIso } from '../../../shared/utils';
import type { BalanceTransaction } from '../../database/entities/balance-transaction.entity';
import { formatMoneyCents } from './format-money-cents.util';
import { parseMoneyDecimalString } from './parse-money-decimal-string.util';

/**
 * Map ledger entity → contract DTO with normalized decimal strings (NFR-1).
 */
export const mapBalanceTransactionToDto = (
  row: BalanceTransaction,
): BalanceTransactionDto => {
  return {
    id: row.id,
    agentId: row.agentId,
    actorId: row.actorId,
    type: row.type,
    amount: formatMoneyCents(parseMoneyDecimalString(String(row.amount))),
    reason: row.reason,
    resultingBalance: formatMoneyCents(
      parseMoneyDecimalString(String(row.resultingBalance)),
    ),
    clientId: row.clientId,
    createdAt: formatIso(row.createdAt),
  };
};
