import { HttpException, HttpStatus } from '@nestjs/common';
import type { Application } from '../../database/entities/application.entity';
import type { User } from '../../database/entities/user.entity';

export const canSeeApp = (user: User, row: Application): boolean => {
  if (user.role === 'client') {
    return (
      row.clientEmail === user.email || row.clientEmail === user.login
    );
  }
  return true;
};

export const assertClientOwns = (user: User, row: Application): void => {
  if (
    user.role === 'client' &&
    row.clientEmail !== user.email &&
    row.clientEmail !== user.login
  ) {
    throw new HttpException('Чужая заявка', HttpStatus.FORBIDDEN);
  }
};
