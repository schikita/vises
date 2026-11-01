import type { BalanceTransactionDto } from '@vises/contracts'
import { ZERO_BALANCE_DISPLAY } from '../constants/zero-balance-display.constants'

/**
 * Current balance from newest-first ledger (no float re-round).
 * Empty ledger → scale-2 zero display string.
 */
export const resolveCurrentBalanceFromLedger = (
  transactions: BalanceTransactionDto[],
): string => {
  const newest = transactions[0]
  if (!newest) {
    return ZERO_BALANCE_DISPLAY
  }
  return newest.resultingBalance
}
