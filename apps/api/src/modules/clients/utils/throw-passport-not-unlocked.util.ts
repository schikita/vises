import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * NFR-6 / AC-7 — passport write/read without a client-creation debit ledger row.
 */
export const throwPassportNotUnlocked = (): never => {
  throw new HttpException(
    { detail: 'passport_not_unlocked' },
    HttpStatus.CONFLICT,
  );
};
