import type { PiiEncryptedFieldMap } from '../../pii';
import { PII_ENCRYPTED_FIELD_KEYS } from '../../pii';
import type { ClientPassportPlainOut } from '../types';

/** Normalize decrypted field map → full plaintext out (null for unset). */
export const buildPassportPlainOut = (
  fields: PiiEncryptedFieldMap,
): ClientPassportPlainOut => {
  const out = {} as ClientPassportPlainOut;
  for (const key of PII_ENCRYPTED_FIELD_KEYS) {
    const value = fields[key];
    out[key] = value === undefined || value === null ? null : value;
  }
  return out;
};
