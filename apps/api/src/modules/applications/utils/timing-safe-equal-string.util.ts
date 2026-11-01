import { timingSafeEqual } from 'node:crypto';

/**
 * Constant-time string compare for API keys.
 * Different lengths still return false without leaking via early exit of equals.
 */
export const timingSafeEqualString = (
  provided: string,
  expected: string,
): boolean => {
  const a = Buffer.from(provided, 'utf8');
  const b = Buffer.from(expected, 'utf8');
  if (a.length !== b.length) {
    // Compare against self so timing does not short-circuit on length alone.
    timingSafeEqual(a, a);
    return false;
  }
  return timingSafeEqual(a, b);
};
