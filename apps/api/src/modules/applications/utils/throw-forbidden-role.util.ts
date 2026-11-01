import { HttpException, HttpStatus } from '@nestjs/common';

/** NFR-6 — agent is not the owning agent for this application. */
export const throwForbiddenRole = (): never => {
  throw new HttpException(
    { detail: 'forbidden_role' },
    HttpStatus.FORBIDDEN,
  );
};
