import type { BalanceTransaction } from '../../database/entities/balance-transaction.entity';
import {
  SEED_CLIENT_CREATION_DEBIT_REASON,
  SEED_DEFAULT_PRICE,
  SEED_TOP_UP_REASON,
} from '../constants';
import type { BuildAgentSeedLedgerInput } from '../types';
import { addSeedUtcDays } from './add-seed-utc-days.util';
import { formatSeedMoney } from './format-seed-money.util';

/**
 * Agent top_up (reason `seed`) + one `client_creation_debit` per client.
 * Debit rows store client id and resulting balance after that debit (AC-19).
 */
export const buildAgentSeedLedger = (
  input: BuildAgentSeedLedgerInput,
): BalanceTransaction[] => {
  const rows: BalanceTransaction[] = [];
  const topUpAmount = formatSeedMoney(input.topUpAmountWhole, 1);
  const topUpTime = addSeedUtcDays(input.baseTime, 0);

  rows.push(
    input.ledger.create({
      id: `${input.idPrefix}-topup`,
      agentId: input.agentId,
      actorId: input.topUpActorId,
      type: 'top_up',
      amount: topUpAmount,
      reason: SEED_TOP_UP_REASON,
      resultingBalance: topUpAmount,
      clientId: null,
      createdAt: topUpTime,
    }),
  );

  let balanceWhole = input.topUpAmountWhole;
  input.clientIds.forEach((clientId, index) => {
    balanceWhole -= SEED_DEFAULT_PRICE;
    rows.push(
      input.ledger.create({
        id: `${input.idPrefix}-debit-${index + 1}`,
        agentId: input.agentId,
        actorId: input.agentId,
        type: 'client_creation_debit',
        amount: formatSeedMoney(SEED_DEFAULT_PRICE, -1),
        reason: SEED_CLIENT_CREATION_DEBIT_REASON,
        resultingBalance: formatSeedMoney(balanceWhole, 1),
        clientId,
        createdAt: addSeedUtcDays(input.baseTime, index + 1),
      }),
    );
  });

  return rows;
};
