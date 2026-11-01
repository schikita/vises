import { formatMoneyCents } from './format-money-cents.util';
import { parseMoneyDecimalString } from './parse-money-decimal-string.util';

/**
 * Apply a signed cent delta to a stored balance string (NFR-1 integer math).
 */
export const applyBalanceDelta = (
  currentBalance: string | null | undefined,
  deltaCents: bigint,
): string => {
  const current =
    currentBalance == null || currentBalance === ''
      ? 0n
      : parseMoneyDecimalString(String(currentBalance));
  return formatMoneyCents(current + deltaCents);
};
