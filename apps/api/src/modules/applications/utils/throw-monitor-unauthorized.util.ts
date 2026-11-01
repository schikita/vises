import { HttpException, HttpStatus } from '@nestjs/common';

/** AC-13 — missing/invalid visa center monitor API key. */
export const throwMonitorUnauthorized = (): never => {
  throw new HttpException(
    { detail: 'Unauthorized' },
    HttpStatus.UNAUTHORIZED,
  );
};
