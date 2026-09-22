import { SECRETS_AES_KEY_BYTES } from '../constants/secrets-crypto.constants';

/**
 * Parse `VISES_SECRETS_MASTER_KEY` (base64 32 bytes).
 * Empty/whitespace → `null` (crypto unused until configured).
 * Non-empty invalid length → throws (fail-closed; never logs key material).
 */
export const parseSecretsMasterKey = (raw: string): Buffer | null => {
  const trimmed = raw.trim();
  if (!trimmed) {
    return null;
  }
  const key = Buffer.from(trimmed, 'base64');
  if (key.length !== SECRETS_AES_KEY_BYTES) {
    throw new Error(
      `VISES_SECRETS_MASTER_KEY must decode to ${SECRETS_AES_KEY_BYTES} bytes`,
    );
  }
  return key;
};
