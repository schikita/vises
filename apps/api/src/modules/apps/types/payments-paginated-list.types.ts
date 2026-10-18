import type { PaginatedList } from '../../../shared/types';
import type { AppOutWithPortalProgress } from './app-out-with-portal-progress.types';
import type { PaymentsSummary } from './payments-summary.types';

/** Paged payments list + full-set summary (DEC-005 / DEC-009). */
export type PaymentsPaginatedList = PaginatedList<AppOutWithPortalProgress> & {
  summary: PaymentsSummary;
};
