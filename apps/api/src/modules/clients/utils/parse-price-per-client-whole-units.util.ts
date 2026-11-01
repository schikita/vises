import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Map settings `price_per_client` decimal string → whole currency units for
 * Application.paymentAmount (int column). Rejects non-whole values.
 */
export const parsePricePerClientWholeUnits = (pricePerClient: string): number => {
  const match = /^(\d+)\.00$/.exec(pricePerClient.trim());
  if (!match) {
    throw new HttpException(
      { detail: 'invalid_amount' },
      HttpStatus.BAD_REQUEST,
    );
  }
  return Number.parseInt(match[1], 10);
};
