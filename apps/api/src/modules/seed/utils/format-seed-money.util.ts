/**
 * Format a whole-unit money amount as a scale-2 decimal string (NFR-1).
 * `sign` of -1 yields a leading minus (ledger debit amounts).
 */
export const formatSeedMoney = (
  wholeUnits: number,
  sign: 1 | -1 = 1,
): string => {
  const body = `${Math.abs(wholeUnits).toFixed(2)}`;
  return sign < 0 ? `-${body}` : body;
};
