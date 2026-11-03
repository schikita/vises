/**
 * Decimal-string balance for agent list rows (DEC-P5).
 * Null/empty → `0.00`; otherwise pass through the stored numeric string.
 */
export const formatAgentCurrentBalance = (
  balance: string | null | undefined,
): string => {
  if (balance === null || balance === undefined || String(balance).trim() === '') {
    return '0.00';
  }
  return String(balance);
};
