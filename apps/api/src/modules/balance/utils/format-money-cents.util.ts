import { MONEY_CENTS_PER_UNIT } from '../constants';

/**
 * Format integer cents as a scale-2 decimal string for JSON/DB (NFR-1).
 */
export const formatMoneyCents = (cents: bigint): string => {
  const negative = cents < 0n;
  const abs = negative ? -cents : cents;
  const whole = abs / MONEY_CENTS_PER_UNIT;
  const frac = abs % MONEY_CENTS_PER_UNIT;
  const body = `${whole.toString()}.${frac.toString().padStart(2, '0')}`;
  return negative ? `-${body}` : body;
};
