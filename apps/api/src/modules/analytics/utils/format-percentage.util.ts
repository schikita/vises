/**
 * §6.7.1 / AC-15a: percentage = count / total × 100, rounded to 2 decimals,
 * encoded as a decimal string. Zero total → `"0.00"`.
 */
export const formatPercentage = (count: number, total: number): string => {
  if (total <= 0) {
    return '0.00';
  }
  const raw = (count / total) * 100;
  const rounded = Math.round(raw * 100) / 100;
  return rounded.toFixed(2);
};
