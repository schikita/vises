/**
 * Keep task lastErrorMessage / client failure text free of PII values.
 * Retains field ids and reason codes; strips emails and long digit runs.
 */
export const sanitizeBlsStatusClientErrorMessage = (
  message: string | null | undefined,
): string => {
  const raw = (message ?? '').trim().slice(0, 500);
  if (!raw) {
    return 'Status validate failed';
  }
  return raw
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[redacted-email]')
    .replace(/\b\d{6,}\b/g, '[redacted-digits]')
    .slice(0, 500);
};
