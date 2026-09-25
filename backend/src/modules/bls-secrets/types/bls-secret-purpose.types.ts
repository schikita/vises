import { BLS_SECRET_PURPOSE } from '../constants/bls-secret-purpose.constants';

/** Vault secret purpose (DEC-005). */
export type BlsSecretPurpose =
  (typeof BLS_SECRET_PURPOSE)[keyof typeof BLS_SECRET_PURPOSE];
