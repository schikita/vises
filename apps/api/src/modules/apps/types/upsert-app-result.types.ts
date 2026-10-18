import type { UserCredentialsOut } from '../../users/types';
import type { AppOutWithPortalProgress } from './app-out-with-portal-progress.types';

/** Credentials returned only when staff create minted a new client (DEC-005). */
export type IssuedClientAccess = UserCredentialsOut;

export type UpsertAppResult = AppOutWithPortalProgress & {
  issuedClientAccess?: IssuedClientAccess;
};
