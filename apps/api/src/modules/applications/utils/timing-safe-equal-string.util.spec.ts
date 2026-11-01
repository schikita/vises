import { timingSafeEqualString } from './timing-safe-equal-string.util';

describe('timingSafeEqualString', (): void => {
  it('returns true for equal strings', (): void => {
    expect(timingSafeEqualString('secret-key', 'secret-key')).toBe(true);
  });

  it('returns false for unequal values or lengths', (): void => {
    expect(timingSafeEqualString('secret-key', 'secret-KEY')).toBe(false);
    expect(timingSafeEqualString('short', 'longer-value')).toBe(false);
    expect(timingSafeEqualString('', 'x')).toBe(false);
  });
});
