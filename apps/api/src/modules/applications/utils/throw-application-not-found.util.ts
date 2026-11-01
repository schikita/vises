import { HttpException, HttpStatus } from '@nestjs/common';

/** NFR-6 — application id missing. */
export const throwApplicationNotFound = (): never => {
  throw new HttpException(
    { detail: 'application_not_found' },
    HttpStatus.NOT_FOUND,
  );
};
