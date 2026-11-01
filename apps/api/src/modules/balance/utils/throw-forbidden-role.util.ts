import { HttpException, HttpStatus } from '@nestjs/common';

/** NFR-6 — agent self top-up/adjust or cross-tenant ledger read. */
export const throwForbiddenRole = (): never => {
  throw new HttpException(
    { detail: 'forbidden_role' },
    HttpStatus.FORBIDDEN,
  );
};
