import type { MessageEnvelope } from '@vises/contracts';

/** True when value looks like a DEC-022 MessageEnvelope (reject bare payloads). */
export const isMessageEnvelope = (
  value: unknown,
): value is MessageEnvelope => {
  if (value == null || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }
  const record = value as Record<string, unknown>;
  return (
    typeof record.correlationId === 'string' &&
    record.correlationId.trim().length > 0 &&
    'payload' in record
  );
};
