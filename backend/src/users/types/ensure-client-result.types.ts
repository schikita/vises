import type { UserOut } from './user-out.types';

/** Result of internal ensure-client (DEC-001); credentials only when created. */
export type EnsureClientResult = {
  user: UserOut;
  created: boolean;
  password?: string;
  token?: string;
};
