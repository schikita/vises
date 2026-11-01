import { createDecipheriv } from 'crypto';
import {
  AES_256_GCM_AUTH_TAG_BYTES,
  AES_256_GCM_IV_BYTES,
  AES_256_KEY_BYTES,
} from '../constants/aes-256-gcm.constants';

/**
 * AES-256-GCM decrypt for `iv:authTag:ciphertext` (each segment base64).
 * Never log plaintext or key material.
 */
export const aes256GcmDecryptColon = (
  key: Buffer,
  packed: string,
): string => {
  if (key.length !== AES_256_KEY_BYTES) {
    throw new Error(`AES-256 key must be ${AES_256_KEY_BYTES} bytes`);
  }
  const parts = packed.split(':');
  if (parts.length !== 3) {
    throw new Error('AES-GCM packed value must have three base64 segments');
  }
  const [ivB64, authTagB64, ciphertextB64] = parts;
  if (!ivB64 || !authTagB64 || !ciphertextB64) {
    throw new Error('AES-GCM packed value has empty segment');
  }
  const iv = Buffer.from(ivB64, 'base64');
  const authTag = Buffer.from(authTagB64, 'base64');
  const ciphertext = Buffer.from(ciphertextB64, 'base64');
  if (iv.length !== AES_256_GCM_IV_BYTES) {
    throw new Error('AES-GCM IV length mismatch');
  }
  if (authTag.length !== AES_256_GCM_AUTH_TAG_BYTES) {
    throw new Error('AES-GCM auth tag length mismatch');
  }
  if (ciphertext.length === 0) {
    throw new Error('AES-GCM ciphertext empty');
  }
  const decipher = createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]).toString('utf8');
};
