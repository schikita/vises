import { HttpException, HttpStatus } from '@nestjs/common';

/** NFR-6 — client id missing or not visible to actor. */
export const throwClientNotFound = (): never => {
  throw new HttpException(
    { detail: 'client_not_found' },
    HttpStatus.NOT_FOUND,
  );
};
