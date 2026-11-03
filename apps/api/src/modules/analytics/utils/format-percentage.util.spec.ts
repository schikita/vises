import { formatPercentage } from './format-percentage.util';

describe('formatPercentage (AC-15a / §6.7.1)', (): void => {
  it('returns 0.00 when total is zero', (): void => {
    expect(formatPercentage(0, 0)).toBe('0.00');
    expect(formatPercentage(5, 0)).toBe('0.00');
  });

  it('formats exact halves as two-decimal strings', (): void => {
    expect(formatPercentage(1, 2)).toBe('50.00');
    expect(formatPercentage(1, 4)).toBe('25.00');
  });

  it('rounds to two decimals (half-up via Math.round)', (): void => {
    // 1/3 * 100 = 33.333… → 33.33
    expect(formatPercentage(1, 3)).toBe('33.33');
    // 2/3 * 100 = 66.666… → 66.67
    expect(formatPercentage(2, 3)).toBe('66.67');
  });

  it('formats status-share percentages used by analytics', (): void => {
    // 2 of 8 → 25.00%
    expect(formatPercentage(2, 8)).toBe('25.00');
    // 1 of 8 → 12.50%
    expect(formatPercentage(1, 8)).toBe('12.50');
  });
});
