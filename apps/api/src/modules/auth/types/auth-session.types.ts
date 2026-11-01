import type { UserOut } from '../../../shared/types';

export type AuthSession = {
  token: string;
  user: UserOut;
};
