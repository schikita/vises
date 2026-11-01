import {
  AES_256_KEY_BYTES,
  AES_256_KEY_HEX_LENGTH,
} from '../constants/aes-256-gcm.constants';

/**
 * Parse a 64-char hex AES-256 key.
 * Empty/whitespace → `null`. Non-empty invalid → throws (never logs key material).
 *
 * v1 duplicate of `apps/api/src/shared/utils/parse-aes-256-key-hex.util.ts`
 * (worker must not import `apps/api` paths).
 */
export const parseAes256KeyHex = (raw: string): Buffer | null => {
  const trimmed = raw.trim();
  if (!trimmed) {
    return null;
  }
  if (
    trimmed.length !== AES_256_KEY_HEX_LENGTH ||
    !/^[0-9a-fA-F]+$/.test(trimmed)
  ) {
    throw new Error(
      `AES-256 key must be exactly ${AES_256_KEY_HEX_LENGTH} hex characters`,
    );
  }
  const key = Buffer.from(trimmed, 'hex');
  if (key.length !== AES_256_KEY_BYTES) {
    throw new Error(`AES-256 key must decode to ${AES_256_KEY_BYTES} bytes`);
  }
  return key;
};
