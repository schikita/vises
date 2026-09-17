import type { UserOut } from './user-out.types';

export type UserCredentialsOut = {
  user: UserOut;
  password: string;
  token: string;
};
