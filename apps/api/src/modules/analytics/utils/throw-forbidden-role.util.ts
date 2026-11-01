import { HttpException, HttpStatus } from '@nestjs/common';

/** NFR-6 — role cannot access analytics (FR-9). */
export const throwForbiddenRole = (): never => {
  throw new HttpException(
    { detail: 'forbidden_role' },
    HttpStatus.FORBIDDEN,
  );
};
