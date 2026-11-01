import { HttpException, HttpStatus } from '@nestjs/common';

/** NFR-6 / edge 14 — balance mutation target is not an agent. */
export const throwNotAgent = (): never => {
  throw new HttpException({ detail: 'not_agent' }, HttpStatus.BAD_REQUEST);
};
