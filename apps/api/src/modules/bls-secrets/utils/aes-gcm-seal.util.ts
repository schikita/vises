import { createCipheriv, randomBytes } from 'crypto';
import {
  SECRETS_GCM_AUTH_TAG_BYTES,
  SECRETS_GCM_NONCE_BYTES,
} from '../constants';

/**
 * AES-256-GCM seal: returns nonce + (ciphertext ‖ authTag).
 * Caller must zeroize sensitive buffers after use; never log inputs.
 */
export const aesGcmSeal = (
  key: Buffer,
  plain: Buffer,
): { nonce: Buffer; ciphertext: Buffer } => {
  const nonce = randomBytes(SECRETS_GCM_NONCE_BYTES);
  const cipher = createCipheriv('aes-256-gcm', key, nonce);
  const encrypted = Buffer.concat([cipher.update(plain), cipher.final()]);
  const authTag = cipher.getAuthTag();
  if (authTag.length !== SECRETS_GCM_AUTH_TAG_BYTES) {
    throw new Error('AES-GCM auth tag length mismatch');
  }
  return {
    nonce,
    ciphertext: Buffer.concat([encrypted, authTag]),
  };
};
