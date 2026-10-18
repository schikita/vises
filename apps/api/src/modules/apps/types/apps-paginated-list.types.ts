import type { PaginatedList } from '../../../shared/types';
import type { AppOutWithPortalProgress } from './app-out-with-portal-progress.types';

/** Paged apps list envelope (+ optional city facet, DEC-003). */
export type AppsPaginatedList = PaginatedList<AppOutWithPortalProgress> & {
  cities?: string[];
};
