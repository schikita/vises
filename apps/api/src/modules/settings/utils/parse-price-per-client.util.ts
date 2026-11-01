import { HttpException, HttpStatus } from '@nestjs/common';
import { PRICE_PER_CLIENT_PATTERN } from '../constants';

/**
 * Parse API `price_per_client` decimal string into int `Setting.defaultPrice`.
 * Rejects fractional non-zero amounts (physical column is int; no silent rounding).
 */
export const parsePricePerClientToDefaultPrice = (
  pricePerClient: string,
): number => {
  const trimmed = pricePerClient.trim();
  if (!PRICE_PER_CLIENT_PATTERN.test(trimmed)) {
    throw new HttpException('Invalid price_per_client', HttpStatus.BAD_REQUEST);
  }

  return Number.parseInt(trimmed.split('.')[0] ?? trimmed, 10);
};
