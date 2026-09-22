import { aesGcmSeal } from './aes-gcm-seal.util';

/**
 * Wrap a DEK with the master key (AES-256-GCM).
 * Packed layout: wrapNonce (12) ‖ ciphertext ‖ authTag.
 */
export const wrapDek = (masterKey: Buffer, dek: Buffer): Buffer => {
  const sealed = aesGcmSeal(masterKey, dek);
  return Buffer.concat([sealed.nonce, sealed.ciphertext]);
};
