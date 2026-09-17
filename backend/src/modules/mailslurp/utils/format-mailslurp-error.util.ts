/**
 * Format MailSlurp errors without leaking the API key (NFR-004).
 */
export const formatMailSlurpError = (
  phase: string,
  err: unknown,
  apiKey?: string,
): string => {
  let detail = err instanceof Error ? err.message : String(err);
  const key = apiKey?.trim();
  if (key && key.length > 0 && detail.includes(key)) {
    detail = detail.split(key).join('[redacted]');
  }
  return `MailSlurp ${phase} failed: ${detail}`;
};
