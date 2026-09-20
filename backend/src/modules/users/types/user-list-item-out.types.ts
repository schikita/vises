import type { UserOut } from './user-out.types';

/** Users list item with latest application id for row navigation (DEC-007). */
export type UserListItemOut = UserOut & {
  latestAppId: string | null;
};
