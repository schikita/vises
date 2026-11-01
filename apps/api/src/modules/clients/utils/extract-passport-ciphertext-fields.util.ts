import type { PiiEncryptedFieldMap } from '../../pii';
import { PII_ENCRYPTED_FIELD_KEYS } from '../../pii';
import type { Client } from '../../database/entities/client.entity';

/** Collect FR-6 encrypted columns from a Client row (ciphertext or null). */
export const extractPassportCiphertextFields = (
  client: Client,
): PiiEncryptedFieldMap => {
  const out: PiiEncryptedFieldMap = {};
  for (const key of PII_ENCRYPTED_FIELD_KEYS) {
    out[key] = client[key];
  }
  return out;
};
