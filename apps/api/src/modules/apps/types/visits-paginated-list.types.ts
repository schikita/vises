import type { PaginatedList } from '../../../shared/types';
import type { AppOutWithPortalProgress } from './app-out-with-portal-progress.types';

/** Paged visits list envelope (+ optional city facet, DEC-003 / DEC-004). */
export type VisitsPaginatedList = PaginatedList<AppOutWithPortalProgress> & {
  cities?: string[];
};
