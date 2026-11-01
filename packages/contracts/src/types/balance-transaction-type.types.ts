/**
 * Balance ledger transaction kind union (FR-4 / FR-11 / NFR-9). No enum.
 */
export type BalanceTransactionType =
  | 'top_up'
  | 'adjust'
  | 'client_creation_debit';
