import {
  MONEY_CENTS_PER_UNIT,
  MONEY_DECIMAL_STRING_PATTERN,
} from '../constants';
import { throwInvalidAmount } from './throw-invalid-amount.util';

/**
 * Parse a decimal money string to integer cents (NFR-1 — no float).
 * Rejects malformed input with `invalid_amount`.
 */
export const parseMoneyDecimalString = (raw: string): bigint => {
  const trimmed = raw.trim();
  if (!MONEY_DECIMAL_STRING_PATTERN.test(trimmed)) {
    return throwInvalidAmount();
  }

  const negative = trimmed.startsWith('-');
  const unsigned = trimmed.replace(/^[+-]/, '');
  const [wholePart, fracPart = ''] = unsigned.split('.');
  const whole = BigInt(wholePart);
  const fracPadded = `${fracPart}00`.slice(0, 2);
  const cents = whole * MONEY_CENTS_PER_UNIT + BigInt(fracPadded);
  return negative ? -cents : cents;
};
