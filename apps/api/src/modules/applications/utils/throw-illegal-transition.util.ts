import { HttpException, HttpStatus } from '@nestjs/common';

/** NFR-6 / AC-12 — source→target or actor not allowed by FR-7.4 matrix. */
export const throwIllegalTransition = (): never => {
  throw new HttpException(
    { detail: 'illegal_transition' },
    HttpStatus.BAD_REQUEST,
  );
};
