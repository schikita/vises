import type { BalanceTransaction } from '../../database/entities/balance-transaction.entity';
import { buildAgentSeedLedger } from './build-agent-seed-ledger.util';

describe('buildAgentSeedLedger', (): void => {
  const create = (
    data: Partial<BalanceTransaction>,
  ): BalanceTransaction => data as BalanceTransaction;

  it('builds seed top_up then client_creation_debit rows with resulting balances', (): void => {
    const clientIds = [
      'c-a-1',
      'c-a-2',
      'c-a-3',
      'c-a-4',
      'c-a-5',
      'c-a-6',
      'c-a-7',
      'c-a-8',
    ];
    const rows = buildAgentSeedLedger({
      ledger: { create },
      agentId: 'u-agent-a',
      topUpActorId: 'u-superadmin',
      topUpAmountWhole: 1800,
      clientIds,
      idPrefix: 'btx-a',
      baseTime: new Date('2026-01-01T10:00:00.000Z'),
    });

    expect(rows).toHaveLength(9);
    expect(rows[0]?.type).toBe('top_up');
    expect(rows[0]?.reason).toBe('seed');
    expect(rows[0]?.amount).toBe('1800.00');
    expect(rows[0]?.resultingBalance).toBe('1800.00');
    expect(rows[0]?.clientId).toBeNull();

    const debits = rows.slice(1);
    expect(debits.every((row) => row.type === 'client_creation_debit')).toBe(
      true,
    );
    expect(debits.map((row) => row.clientId)).toEqual(clientIds);
    expect(debits.map((row) => row.amount)).toEqual(
      Array.from({ length: 8 }, () => '-180.00'),
    );
    expect(debits.map((row) => row.resultingBalance)).toEqual([
      '1620.00',
      '1440.00',
      '1260.00',
      '1080.00',
      '900.00',
      '720.00',
      '540.00',
      '360.00',
    ]);
  });

  it('ends Agent B at 0.00 after 900 top_up and 5×180 debits', (): void => {
    const rows = buildAgentSeedLedger({
      ledger: { create },
      agentId: 'u-agent-b',
      topUpActorId: 'u-superadmin',
      topUpAmountWhole: 900,
      clientIds: ['c-b-1', 'c-b-2', 'c-b-3', 'c-b-4', 'c-b-5'],
      idPrefix: 'btx-b',
      baseTime: new Date('2026-01-01T10:00:00.000Z'),
    });

    expect(rows[rows.length - 1]?.resultingBalance).toBe('0.00');
  });
});
