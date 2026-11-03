/**
 * Decimal-string total revenue for agent list rows (DEC-P13).
 * Null/empty/non-finite → `0.00`; otherwise two-decimal fixed string.
 */
export const formatAgentTotalRevenue = (
  sum: string | number | null | undefined,
): string => {
  if (sum === null || sum === undefined || String(sum).trim() === '') {
    return '0.00';
  }
  const n = typeof sum === 'number' ? sum : Number(sum);
  if (!Number.isFinite(n)) {
    return '0.00';
  }
  return n.toFixed(2);
};
