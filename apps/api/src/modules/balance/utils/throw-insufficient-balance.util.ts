import { HttpException, HttpStatus } from '@nestjs/common';

/** NFR-6 / AC-5 — debit would overdraw agent balance. */
export const throwInsufficientBalance = (): never => {
  throw new HttpException(
    { detail: 'insufficient_balance' },
    HttpStatus.CONFLICT,
  );
};
