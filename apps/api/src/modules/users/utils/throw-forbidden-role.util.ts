import { HttpException, HttpStatus } from '@nestjs/common';

/** NFR-6 / RolesGuard-compatible ACL rejection. */
export const throwForbiddenRole = (): never => {
  throw new HttpException(
    { detail: 'forbidden_role' },
    HttpStatus.FORBIDDEN,
  );
};
