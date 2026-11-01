import { HttpException } from '@nestjs/common';
import { parsePricePerClientToDefaultPrice } from './parse-price-per-client.util';

describe('parsePricePerClientToDefaultPrice (AC-4 / FR-3)', (): void => {
  it('parses whole-number decimal strings into int defaultPrice', (): void => {
    expect(parsePricePerClientToDefaultPrice('180')).toBe(180);
    expect(parsePricePerClientToDefaultPrice('180.00')).toBe(180);
    expect(parsePricePerClientToDefaultPrice('0')).toBe(0);
    expect(parsePricePerClientToDefaultPrice('0.00')).toBe(0);
  });

  it('rejects fractional non-zero amounts without rounding', (): void => {
    expect((): number => parsePricePerClientToDefaultPrice('180.49')).toThrow(
      HttpException,
    );
    expect((): number => parsePricePerClientToDefaultPrice('180.50')).toThrow(
      HttpException,
    );
    expect((): number => parsePricePerClientToDefaultPrice('180.01')).toThrow(
      HttpException,
    );
    expect((): number => parsePricePerClientToDefaultPrice('180.0')).toThrow(
      HttpException,
    );
  });

  it('rejects malformed decimal strings', (): void => {
    expect((): number => parsePricePerClientToDefaultPrice('-1')).toThrow(
      HttpException,
    );
    expect((): number => parsePricePerClientToDefaultPrice('abc')).toThrow(
      HttpException,
    );
    expect((): number => parsePricePerClientToDefaultPrice('1.234')).toThrow(
      HttpException,
    );
  });
});
