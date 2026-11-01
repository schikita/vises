import type { User } from '../../database/entities/user.entity';
import type { CreateUserDto } from '../dto/create-user.dto';
import type { PatchUserDto } from '../dto/patch-user.dto';
import type {
  EnsureClientResult,
  ManagerNamesOut,
  UserCredentialsOut,
  UserOut,
  UsersListQuery,
  UsersPaginatedList,
} from '../types';

export interface IUsersService {
  list(): Promise<UserOut[]>;
  listPaged(query: UsersListQuery): Promise<UsersPaginatedList>;
  listActiveManagerNames(): Promise<ManagerNamesOut>;
  create(body: CreateUserDto, actor: User): Promise<UserCredentialsOut>;
  ensureClientForIdentity(
    identity: string,
    name: string,
  ): Promise<EnsureClientResult>;
  patch(
    userId: string,
    body: PatchUserDto,
    actor: User,
  ): Promise<UserOut>;
  reissue(userId: string, actor: User): Promise<UserCredentialsOut>;
  remove(userId: string, actor: User): Promise<{ ok: true }>;
}
