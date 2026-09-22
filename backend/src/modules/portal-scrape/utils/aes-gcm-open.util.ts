import { createDecipheriv } from 'crypto';
import { SECRETS_GCM_AUTH_TAG_BYTES } from '../constants/secrets-crypto.constants';

/**
 * AES-256-GCM open for ciphertext produced by `aesGcmSeal`
 * (ciphertext ‖ authTag). Never log plain or key material.
 */
export const aesGcmOpen = (
  key: Buffer,
  nonce: Buffer,
  ciphertextWithTag: Buffer,
): Buffer => {
  if (ciphertextWithTag.length <= SECRETS_GCM_AUTH_TAG_BYTES) {
    throw new Error('AES-GCM ciphertext too short');
  }
  const encrypted = ciphertextWithTag.subarray(
    0,
    ciphertextWithTag.length - SECRETS_GCM_AUTH_TAG_BYTES,
  );
  const authTag = ciphertextWithTag.subarray(
    ciphertextWithTag.length - SECRETS_GCM_AUTH_TAG_BYTES,
  );
  const decipher = createDecipheriv('aes-256-gcm', key, nonce);
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]);
};
