import { createCipheriv, randomBytes } from 'crypto';
import {
  AES_256_GCM_AUTH_TAG_BYTES,
  AES_256_GCM_IV_BYTES,
  AES_256_KEY_BYTES,
} from '../constants/aes-256-gcm.constants';

/**
 * AES-256-GCM encrypt → `iv:authTag:ciphertext` (each segment base64).
 * Never log plaintext or key material.
 */
export const aes256GcmEncryptColon = (key: Buffer, plain: string): string => {
  if (key.length !== AES_256_KEY_BYTES) {
    throw new Error(`AES-256 key must be ${AES_256_KEY_BYTES} bytes`);
  }
  const iv = randomBytes(AES_256_GCM_IV_BYTES);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([
    cipher.update(Buffer.from(plain, 'utf8')),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();
  if (authTag.length !== AES_256_GCM_AUTH_TAG_BYTES) {
    throw new Error('AES-GCM auth tag length mismatch');
  }
  return `${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted.toString('base64')}`;
};
