import type { PaginatedList } from '../../../shared/types';
import type { UserListItemOut } from './user-list-item-out.types';

/** Paged users list envelope (DEC-003 / DEC-006). */
export type UsersPaginatedList = PaginatedList<UserListItemOut>;
