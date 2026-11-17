import { HttpException, HttpStatus } from '@nestjs/common';

/** NFR-010 / DEC-ASAU-006 — agent denied for delete or payment write. */
export const throwForbiddenRole = (): never => {
  throw new HttpException(
    { detail: 'forbidden_role' },
    HttpStatus.FORBIDDEN,
  );
};
