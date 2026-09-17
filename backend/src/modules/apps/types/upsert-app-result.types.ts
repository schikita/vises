import type { UserCredentialsOut } from '../../users/types';
import type { AppOut } from './app-out.types';

/** Credentials returned only when staff create minted a new client (DEC-005). */
export type IssuedClientAccess = UserCredentialsOut;

export type UpsertAppResult = AppOut & {
  issuedClientAccess?: IssuedClientAccess;
};
