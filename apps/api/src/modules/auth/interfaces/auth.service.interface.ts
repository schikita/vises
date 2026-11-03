import type { StaffRole, UserMeDto } from '@vises/contracts';
import type { UserOut } from '../../../shared/types';
import type { User } from '../../database/entities/user.entity';
import type { RegisterDto } from '../dto/register.dto';
import type { AuthSession } from '../types';

export interface IAuthService {
  login(identifier: string, password: string): Promise<AuthSession>;
  register(body: RegisterDto): Promise<AuthSession>;
  demo(role: StaffRole): Promise<AuthSession>;
  me(user: User): UserMeDto;
  invite(token: string): Promise<UserOut>;
}
