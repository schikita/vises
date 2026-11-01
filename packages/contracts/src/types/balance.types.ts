import type { BalanceTransactionType } from './balance-transaction-type.types';

/**
 * Admin/superadmin agent balance top-up body (FR-4 / §6.4 / AC-8).
 * `amount` is a positive decimal string (NFR-1).
 */
export type BalanceTopUpDto = {
  amount: string;
};

/**
 * Admin/superadmin manual balance adjust body (FR-4 / §6.4 / AC-8).
 * `amount` is a signed decimal string; `reason` must be non-empty at runtime.
 */
export type BalanceAdjustDto = {
  amount: string;
  reason: string;
};

/**
 * Immutable ledger row returned by balance transaction APIs (FR-4 / AC-8).
 * Monetary fields are decimal strings (NFR-1 / §6.8).
 */
export type BalanceTransactionDto = {
  id: string;
  agentId: string;
  actorId: string;
  type: BalanceTransactionType;
  amount: string;
  reason: string;
  resultingBalance: string;
  clientId: string | null;
  /** ISO-8601 timestamp */
  createdAt: string;
};
