import type { BalanceTransaction } from '../../database/entities/balance-transaction.entity';
import { buildAgentSeedLedger } from './build-agent-seed-ledger.util';

describe('buildAgentSeedLedger', (): void => {
  const create = (
    data: Partial<BalanceTransaction>,
  ): BalanceTransaction => data as BalanceTransaction;

  it('builds seed top_up then client_creation_debit rows with resulting balances', (): void => {
    const clientIds = [
      'c-01-1',
      'c-01-2',
      'c-01-3',
      'c-01-4',
      'c-01-5',
      'c-01-6',
      'c-01-7',
      'c-01-8',
    ];
    // balance_slots = 8 clients + 2 extra → top_up 1800; remaining 360
    const rows = buildAgentSeedLedger({
      ledger: { create },
      agentId: 'u-agent-01',
      topUpActorId: 'u-superadmin',
      topUpAmountWhole: 1800,
      clientIds,
      idPrefix: 'btx-01',
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

  it('ends at unused-slots balance after top_up minus client debits', (): void => {
    // 5 clients + 0 extra → top_up 900; remaining 0
    const rows = buildAgentSeedLedger({
      ledger: { create },
      agentId: 'u-agent-02',
      topUpActorId: 'u-superadmin',
      topUpAmountWhole: 900,
      clientIds: ['c-02-1', 'c-02-2', 'c-02-3', 'c-02-4', 'c-02-5'],
      idPrefix: 'btx-02',
      baseTime: new Date('2026-01-01T10:00:00.000Z'),
    });

    expect(rows[rows.length - 1]?.resultingBalance).toBe('0.00');
  });
});
