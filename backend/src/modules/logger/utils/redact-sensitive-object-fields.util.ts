import {
  HTTP_ACCESS_LOG_REDACTION_MARKER,
  HTTP_ACCESS_LOG_SENSITIVE_FIELD_KEYS,
} from '../constants';

/**
 * Recursively redact denylisted object keys (case-insensitive) without mutating
 * the caller value (REQ-005 / DEC-006).
 */
export const redactSensitiveObjectFields = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map((item) => redactSensitiveObjectFields(item));
  }

  if (value === null || typeof value !== 'object') {
    return value;
  }

  if (value instanceof Date || Buffer.isBuffer(value)) {
    return value;
  }

  const input = value as Record<string, unknown>;
  const output: Record<string, unknown> = {};

  for (const [key, nested] of Object.entries(input)) {
    const keyLower = key.toLowerCase();
    const isSensitive = HTTP_ACCESS_LOG_SENSITIVE_FIELD_KEYS.some(
      (denied) => denied.toLowerCase() === keyLower,
    );
    output[key] = isSensitive
      ? HTTP_ACCESS_LOG_REDACTION_MARKER
      : redactSensitiveObjectFields(nested);
  }

  return output;
};
