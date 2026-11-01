import {
  PII_AUDIT_CIPHERTEXT_PREFIX_LENGTH,
  PII_AUDIT_EVENT_TYPE,
} from '../constants';
import type { PiiReadAuditContext, PiiReadAuditPayload } from '../types';

/**
 * Build Winston audit payload for a passport PII read.
 * Uses a short ciphertext prefix only — never plaintext.
 */
export const buildPiiReadAuditPayload = (
  context: PiiReadAuditContext,
  packedCiphertext: string,
  timestamp: Date = new Date(),
): PiiReadAuditPayload => {
  return {
    type: PII_AUDIT_EVENT_TYPE,
    actorId: context.actorId,
    actorRole: context.actorRole,
    action: context.action,
    clientId: context.clientId,
    timestamp: timestamp.toISOString(),
    ciphertextPrefix: packedCiphertext.slice(
      0,
      PII_AUDIT_CIPHERTEXT_PREFIX_LENGTH,
    ),
  };
};
