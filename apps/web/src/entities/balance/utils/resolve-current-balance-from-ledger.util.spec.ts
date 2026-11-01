import { describe, expect, it } from 'vitest'
import type { BalanceTransactionDto } from '@vises/contracts'
import { resolveCurrentBalanceFromLedger } from './resolve-current-balance-from-ledger.util'

const row = (
  partial: Partial<BalanceTransactionDto> & Pick<BalanceTransactionDto, 'resultingBalance'>,
): BalanceTransactionDto => ({
  id: partial.id ?? 'btx_1',
  agentId: partial.agentId ?? 'u_1',
  actorId: partial.actorId ?? 'u_admin',
  type: partial.type ?? 'top_up',
  amount: partial.amount ?? '100.00',
  reason: partial.reason ?? 'seed',
  resultingBalance: partial.resultingBalance,
  clientId: partial.clientId ?? null,
  createdAt: partial.createdAt ?? '2026-01-01T00:00:00.000Z',
})

describe('resolveCurrentBalanceFromLedger', (): void => {
  it('returns newest resultingBalance as decimal string (no re-round)', (): void => {
    expect(
      resolveCurrentBalanceFromLedger([
        row({ resultingBalance: '360.00' }),
        row({ id: 'btx_0', resultingBalance: '180.00' }),
      ]),
    ).toBe('360.00')
  })

  it('returns 0.00 when ledger is empty', (): void => {
    expect(resolveCurrentBalanceFromLedger([])).toBe('0.00')
  })
})
