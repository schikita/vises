import { formatMaskedPassportNumber } from './format-masked-passport-number.util';

describe('formatMaskedPassportNumber', (): void => {
  it('masks middle characters (AB****CD style)', (): void => {
    expect(formatMaskedPassportNumber('AB1234567')).toBe('AB****67');
    expect(formatMaskedPassportNumber('ABCD')).toBe('AB****CD');
  });

  it('returns empty string when missing', (): void => {
    expect(formatMaskedPassportNumber(null)).toBe('');
    expect(formatMaskedPassportNumber(undefined)).toBe('');
    expect(formatMaskedPassportNumber('')).toBe('');
  });

  it('returns **** when shorter than 4 chars', (): void => {
    expect(formatMaskedPassportNumber('AB')).toBe('****');
    expect(formatMaskedPassportNumber('A')).toBe('****');
  });
});
