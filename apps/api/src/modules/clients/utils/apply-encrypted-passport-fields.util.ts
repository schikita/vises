import type { PiiEncryptedFieldMap } from '../../pii';
import { PII_ENCRYPTED_FIELD_KEYS } from '../../pii';
import type { Client } from '../../database/entities/client.entity';

/** Apply encrypted field map onto a Client entity (only keys present). */
export const applyEncryptedPassportFields = (
  client: Client,
  encrypted: PiiEncryptedFieldMap,
): void => {
  for (const key of PII_ENCRYPTED_FIELD_KEYS) {
    if (!(key in encrypted)) {
      continue;
    }
    const value = encrypted[key];
    client[key] = value === undefined ? client[key] : value;
  }
};
