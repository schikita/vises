import { HttpException, HttpStatus } from '@nestjs/common';

/** NFR-6 / edge 15 — empty or whitespace-only manual adjust reason. */
export const throwReasonRequired = (): never => {
  throw new HttpException(
    { detail: 'reason_required' },
    HttpStatus.BAD_REQUEST,
  );
};
