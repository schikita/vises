import { HttpException, HttpStatus } from '@nestjs/common';

/** NFR-6 / §6.8 — second superadmin is a business conflict. */
export const throwSuperadminExists = (): never => {
  throw new HttpException(
    { detail: 'superadmin_exists' },
    HttpStatus.CONFLICT,
  );
};
