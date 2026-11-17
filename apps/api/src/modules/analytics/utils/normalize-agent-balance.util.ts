/**
 * Normalize `User.balance` for analytics rows (DEC-ASAU-003 / NFR-001).
 * Null/empty → `"0.00"`; otherwise scale-2 decimal string.
 */
export const normalizeAgentBalance = (balance: string | null): string => {
  if (balance === null || balance.trim() === '') {
    return '0.00';
  }
  const parsed = Number(balance);
  if (!Number.isFinite(parsed)) {
    return '0.00';
  }
  return parsed.toFixed(2);
};
