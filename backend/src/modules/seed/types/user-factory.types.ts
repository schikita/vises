import type { User } from '../../database/entities/user.entity';

export type UserFactory = {
  create: (data: Partial<User>) => User;
};
