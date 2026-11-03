import type { ClientListDto } from './client.types';
import type { PaginatedList } from './paginated-list.types';

/**
 * Paginated `GET /clients` response (qa-polish DEC-P1 / DEC-P3).
 */
export type ClientsListDto = PaginatedList<ClientListDto>;
