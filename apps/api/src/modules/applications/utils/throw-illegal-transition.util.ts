import { HttpException, HttpStatus } from '@nestjs/common';

/** NFR-6 / AC-3 — source→target or actor not allowed by §4.C matrix. */
export const throwIllegalTransition = (): never => {
  throw new HttpException(
    { detail: 'illegal_transition' },
    HttpStatus.BAD_REQUEST,
  );
};
