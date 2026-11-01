import type { PiiEncryptedFieldMap } from '../../pii';
import { PII_ENCRYPTED_FIELD_KEYS } from '../../pii';
import type { ClientPassportUpdateDto } from '../dto/client-passport-update.dto';

/** Pick defined passport body fields into a PII encrypt map (plaintext). */
export const pickPassportUpdateFields = (
  body: ClientPassportUpdateDto,
): PiiEncryptedFieldMap => {
  const out: PiiEncryptedFieldMap = {};
  for (const key of PII_ENCRYPTED_FIELD_KEYS) {
    if (!(key in body)) {
      continue;
    }
    const value = body[key];
    if (value === undefined) {
      continue;
    }
    out[key] = value;
  }
  return out;
};
