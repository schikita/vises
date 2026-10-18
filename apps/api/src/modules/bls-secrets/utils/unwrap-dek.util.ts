import { SECRETS_GCM_NONCE_BYTES } from '../constants';
import { aesGcmOpen } from './aes-gcm-open.util';

/**
 * Unwrap a DEK packed by `wrapDek`: wrapNonce (12) ‖ ciphertext ‖ authTag.
 * Never log DEK or master key material.
 */
export const unwrapDek = (masterKey: Buffer, wrappedDek: Buffer): Buffer => {
  if (wrappedDek.length <= SECRETS_GCM_NONCE_BYTES) {
    throw new Error('Wrapped DEK too short');
  }
  const wrapNonce = wrappedDek.subarray(0, SECRETS_GCM_NONCE_BYTES);
  const ciphertextWithTag = wrappedDek.subarray(SECRETS_GCM_NONCE_BYTES);
  return aesGcmOpen(masterKey, wrapNonce, ciphertextWithTag);
};
