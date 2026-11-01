import { HttpException, HttpStatus } from '@nestjs/common';

/** NFR-6 — non-agent create or cross-tenant client access. */
export const throwForbiddenRole = (): never => {
  throw new HttpException(
    { detail: 'forbidden_role' },
    HttpStatus.FORBIDDEN,
  );
};
