import { PII_ENCRYPTED_FIELD_KEYS } from '../constants';
import type { PiiEncryptedFieldMap } from '../types';

/** Partial update that nulls every FR-6 encrypted Client column (retention). */
export const buildPiiNullEncryptedFields = (): PiiEncryptedFieldMap => {
  const result: PiiEncryptedFieldMap = {};
  for (const key of PII_ENCRYPTED_FIELD_KEYS) {
    result[key] = null;
  }
  return result;
};
