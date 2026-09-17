/**
 * Mask a proxy host/IP for logs (REQ-012). Never returns credentials.
 * Keeps last octet / short tail visible when long enough.
 */
export const maskProxyAddress = (address: string): string => {
  const trimmed = address.trim();
  if (trimmed.length === 0) return '(empty)';
  if (trimmed.length <= 4) return '****';
  return `${'*'.repeat(Math.max(4, trimmed.length - 4))}${trimmed.slice(-4)}`;
};
