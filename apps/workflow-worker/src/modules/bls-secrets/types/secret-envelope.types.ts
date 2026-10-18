import type { BlsSecretPurpose } from './bls-secret-purpose.types';

/**
 * Envelope encryption types (DEC-005 / REQ-014).
 * Ciphertext path only — never log or HTTP-return these fields as useful secrets.
 */

/** In-memory encrypt result before vault persist. */
export type SecretEnvelope = {
  ciphertext: Buffer;
  nonce: Buffer;
  wrappedDek: Buffer;
  keyVersion: number;
};

/** Inputs for vault upsert after encrypt. */
export type PersistBlsSecretInput = {
  workflowId: string;
  applicationId: string;
  purpose: BlsSecretPurpose;
  plain: string;
};

/** Lookup key for decrypt-after-load. */
export type LoadBlsSecretInput = {
  workflowId: string;
  purpose: BlsSecretPurpose;
};
