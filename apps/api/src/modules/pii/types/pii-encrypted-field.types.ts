import { PII_ENCRYPTED_FIELD_KEYS } from '../constants/pii-encrypted-fields.constants';

/** One Client property in the FR-6 encrypted set. */
export type PiiEncryptedFieldKey = (typeof PII_ENCRYPTED_FIELD_KEYS)[number];

/** Partial map of FR-6 fields (plaintext or ciphertext, depending on call site). */
export type PiiEncryptedFieldMap = Partial<
  Record<PiiEncryptedFieldKey, string | null>
>;
