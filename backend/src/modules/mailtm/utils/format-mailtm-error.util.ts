/**
 * Format Mail.tm errors without leaking Bearer tokens or passwords (NFR-001).
 */
export const formatMailTmError = (
  phase: string,
  err: unknown,
  redactSecrets?: string[],
): string => {
  let detail = err instanceof Error ? err.message : String(err);
  for (const secret of redactSecrets ?? []) {
    const key = secret.trim();
    if (key.length > 0 && detail.includes(key)) {
      detail = detail.split(key).join('[redacted]');
    }
  }
  return `Mail.tm ${phase} failed: ${detail}`;
};
