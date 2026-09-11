import type { User } from '../../database/entities/user.entity';
import type { UserOut } from '../../users/types';
import type { AuthSession } from '../types';

export interface IAuthService {
  login(login: string, password: string): Promise<AuthSession>;
  demo(role: string): Promise<AuthSession>;
  me(user: User): UserOut;
  invite(token: string): Promise<UserOut>;
}
