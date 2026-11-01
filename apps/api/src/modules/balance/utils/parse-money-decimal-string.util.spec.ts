import { HttpException, HttpStatus } from '@nestjs/common';
import { formatMoneyCents } from './format-money-cents.util';
import { parseMoneyDecimalString } from './parse-money-decimal-string.util';

describe('parseMoneyDecimalString / formatMoneyCents (NFR-1)', (): void => {
  it('parses whole and fractional decimal strings to cents', (): void => {
    expect(parseMoneyDecimalString('180')).toBe(18000n);
    expect(parseMoneyDecimalString('180.00')).toBe(18000n);
    expect(parseMoneyDecimalString('180.5')).toBe(18050n);
    expect(parseMoneyDecimalString('-50.25')).toBe(-5025n);
    expect(parseMoneyDecimalString('+10.01')).toBe(1001n);
  });

  it('formats cents as scale-2 decimal strings', (): void => {
    expect(formatMoneyCents(18000n)).toBe('180.00');
    expect(formatMoneyCents(-5025n)).toBe('-50.25');
    expect(formatMoneyCents(1n)).toBe('0.01');
  });

  it('rejects malformed amounts with invalid_amount', (): void => {
    expect.assertions(3);
    try {
      parseMoneyDecimalString('12.345');
    } catch (error: unknown) {
      expect(error).toBeInstanceOf(HttpException);
      if (error instanceof HttpException) {
        expect(error.getStatus()).toBe(HttpStatus.BAD_REQUEST);
        expect(error.getResponse()).toEqual({ detail: 'invalid_amount' });
      }
    }
  });
});
