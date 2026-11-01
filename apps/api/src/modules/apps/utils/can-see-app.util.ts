import type { Application } from '../../database/entities/application.entity';
import type { User } from '../../database/entities/user.entity';

export const canSeeApp = (user: User, row: Application): boolean => {
  // T4 remaps away legacy login-client role; string widen keeps compile until then.
  if ((user.role as string) === 'client') {
    return (
      row.clientEmail === user.email || row.clientEmail === user.login
    );
  }
  return true;
};
