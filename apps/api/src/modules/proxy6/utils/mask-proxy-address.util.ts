/**
 * Mask a proxy host/IP for logs and admin APIs (NFR-003 / DEC-010).
 * Never returns credentials. Keeps a short tail visible when long enough.
 */
export const maskProxyAddress = (address: string): string => {
  const trimmed = address.trim();
  if (trimmed.length === 0) return '(empty)';
  if (trimmed.length <= 4) return '****';
  return `${'*'.repeat(Math.max(4, trimmed.length - 4))}${trimmed.slice(-4)}`;
};
