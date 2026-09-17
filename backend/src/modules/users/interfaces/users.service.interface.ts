import type { User } from '../../database/entities/user.entity';
import type { CreateUserDto } from '../dto/create-user.dto';
import type { PatchUserDto } from '../dto/patch-user.dto';
import type {
  EnsureClientResult,
  UserCredentialsOut,
  UserOut,
} from '../types';

export interface IUsersService {
  list(): Promise<UserOut[]>;
  create(body: CreateUserDto): Promise<UserCredentialsOut>;
  ensureClientForIdentity(
    identity: string,
    name: string,
  ): Promise<EnsureClientResult>;
  patch(userId: string, body: PatchUserDto): Promise<UserOut>;
  reissue(userId: string): Promise<UserCredentialsOut>;
  remove(userId: string, actor: User): Promise<{ ok: true }>;
}
