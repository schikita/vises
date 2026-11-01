/** Winston context label for passport PII read audits (FR-6 / AC-10). */
export const PII_AUDIT_LOG_CONTEXT = 'PiiAudit';

/** Audit event type discriminator in the logged JSON payload. */
export const PII_AUDIT_EVENT_TYPE = 'pii_passport_read';

/**
 * Max characters of stored ciphertext (`iv:authTag:ciphertext`) included in
 * audit for correlation only — never plaintext, never full blob.
 */
export const PII_AUDIT_CIPHERTEXT_PREFIX_LENGTH = 24;
