import type { UserOut } from '../../users/types';

/** Current-user projection for `GET /auth/me` — never includes invite/plaintext password. */
export type UserMeOut = Omit<UserOut, 'password'>;
