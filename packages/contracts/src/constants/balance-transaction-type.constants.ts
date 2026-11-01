/**
 * Balance ledger transaction kinds (FR-4 / FR-11 / NFR-9).
 * No TypeScript enum — runtime values via `as const`.
 */
export const BALANCE_TRANSACTION_TYPES = [
  'top_up',
  'adjust',
  'client_creation_debit',
] as const;
