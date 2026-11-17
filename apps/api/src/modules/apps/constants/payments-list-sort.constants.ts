import type { PaymentsListSortKey } from '../types/payments-list-query.types';

export const PAYMENTS_LIST_SORT_KEYS: readonly PaymentsListSortKey[] = [
  'app',
  'amount',
  'status',
  'note',
  'created',
] as const;
