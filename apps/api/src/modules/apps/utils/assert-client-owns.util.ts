import { HttpException, HttpStatus } from '@nestjs/common';
import type { Application } from '../../database/entities/application.entity';
import type { User } from '../../database/entities/user.entity';

export const assertClientOwns = (user: User, row: Application): void => {
  if (
    user.role === 'client' &&
    row.clientEmail !== user.email &&
    row.clientEmail !== user.login
  ) {
    throw new HttpException('Not your application', HttpStatus.FORBIDDEN);
  }
};
