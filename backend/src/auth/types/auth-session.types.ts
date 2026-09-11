import type { UserOut } from '../../users/types';

export type AuthSession = {
  token: string;
  user: UserOut;
};
