/**
 * Context for a successful operational passport PII decrypt (FR-6 / AC-10).
 * Never include plaintext here.
 */
export type PiiReadAuditContext = {
  actorId: string;
  actorRole: string;
  action: string;
  clientId: string;
};

/**
 * Winston audit payload shape (JSON stringified into the log message).
 * `ciphertextPrefix` is a short slice of stored ciphertext only.
 */
export type PiiReadAuditPayload = {
  type: string;
  actorId: string;
  actorRole: string;
  action: string;
  clientId: string;
  timestamp: string;
  ciphertextPrefix: string;
};
