/** Public API for passport PII crypto, audit, and retention. */
export { PiiModule } from './pii.module';
export { PiiCryptoService } from './pii-crypto.service';
export { PiiAuditService } from './pii-audit.service';
export { PiiRetentionJob } from './pii-retention.job';

export {
  PII_ENCRYPTED_FIELD_KEYS,
  PII_MSG_KEY_UNAVAILABLE,
  PII_MSG_DECRYPT_FAILED,
  PII_AUDIT_LOG_CONTEXT,
  PII_AUDIT_EVENT_TYPE,
  PII_AUDIT_CIPHERTEXT_PREFIX_LENGTH,
  PII_RETENTION_CRON,
} from './constants';

export type {
  PiiEncryptedFieldKey,
  PiiEncryptedFieldMap,
  PiiReadAuditContext,
  PiiReadAuditPayload,
} from './types';

export {
  buildPiiReadAuditPayload,
  buildPiiNullEncryptedFields,
} from './utils';
