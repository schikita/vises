import type { UserListItemDto } from '@vises/contracts';
import type { UserOut } from './user-out.types';

/**
 * Users list item: identity + enrichment fields (DEC-007 / DEC-P5 / DEC-P6).
 * Aligns with `UserOut & UserListItemDto` from contracts.
 */
export type UserListItemOut = UserOut & UserListItemDto;
