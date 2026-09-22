import { randomInt } from 'crypto';
import {
  PORTAL_PASSWORD_DEFAULT_LENGTH,
  PORTAL_PASSWORD_DIGIT,
  PORTAL_PASSWORD_LOWER,
  PORTAL_PASSWORD_MIN_LENGTH,
  PORTAL_PASSWORD_SPECIAL,
  PORTAL_PASSWORD_UPPER,
} from '../constants/secrets-crypto.constants';

/**
 * Generate a portal password meeting REQ-013: ≥8 chars with upper, lower,
 * digit, and special. Never hash; store only via SecretsCryptoService vault.
 * Never log the result.
 */
export const generatePortalPassword = (
  length: number = PORTAL_PASSWORD_DEFAULT_LENGTH,
): string => {
  const size = Math.max(length, PORTAL_PASSWORD_MIN_LENGTH);
  const required = [
    PORTAL_PASSWORD_UPPER[randomInt(PORTAL_PASSWORD_UPPER.length)]!,
    PORTAL_PASSWORD_LOWER[randomInt(PORTAL_PASSWORD_LOWER.length)]!,
    PORTAL_PASSWORD_DIGIT[randomInt(PORTAL_PASSWORD_DIGIT.length)]!,
    PORTAL_PASSWORD_SPECIAL[randomInt(PORTAL_PASSWORD_SPECIAL.length)]!,
  ];
  const all =
    PORTAL_PASSWORD_UPPER +
    PORTAL_PASSWORD_LOWER +
    PORTAL_PASSWORD_DIGIT +
    PORTAL_PASSWORD_SPECIAL;
  const chars = [...required];
  while (chars.length < size) {
    chars.push(all[randomInt(all.length)]!);
  }
  for (let i = chars.length - 1; i > 0; i -= 1) {
    const j = randomInt(i + 1);
    const tmp = chars[i]!;
    chars[i] = chars[j]!;
    chars[j] = tmp;
  }
  return chars.join('');
};
