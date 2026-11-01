import { HttpException, HttpStatus } from '@nestjs/common';

/** NFR-6 — malformed or non-positive (top-up) / zero (adjust) money amount. */
export const throwInvalidAmount = (): never => {
  throw new HttpException(
    { detail: 'invalid_amount' },
    HttpStatus.BAD_REQUEST,
  );
};
