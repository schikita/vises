import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Application } from '../database/entities/application.entity';
import { User } from '../database/entities/user.entity';
import { userOut } from '../../shared/mappers';
import {
  buildPaginatedList,
  generateInvitePassword,
  hashPassword,
  uid,
} from '../../shared/utils';
import {
  ADMIN_ROLE,
  DEFAULT_USER_ROLE,
  USER_ROLES,
} from '../auth/constants';
import type { IUsersService } from './interfaces';
import type {
  EnsureClientResult,
  ManagerNamesOut,
  UserCredentialsOut,
  UserListItemOut,
  UserOut,
  UsersListQuery,
  UsersPaginatedList,
} from './types';
import {
  applyUsersListFilters,
  applyUsersListSort,
  isValidEmailFormat,
  normalizeClientIdentity,
  resolveLatestAppIdForUserIdentity,
} from './utils';
import { CreateUserDto } from './dto/create-user.dto';
import { PatchUserDto } from './dto/patch-user.dto';

@Injectable()
export class UsersService implements IUsersService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Application)
    private readonly apps: Repository<Application>,
  ) {}

  async list(): Promise<UserOut[]> {
    const rows = await this.users.find({
      order: { createdAt: 'DESC' },
    });
    return rows.map((u) => userOut(u));
  }

  async listPaged(query: UsersListQuery): Promise<UsersPaginatedList> {
    const countQb = this.users.createQueryBuilder('u');
    applyUsersListFilters(countQb, query);
    const total = await countQb.getCount();

    const qb = this.users.createQueryBuilder('u');
    applyUsersListFilters(qb, query);
    applyUsersListSort(qb, query.sort, query.sortDir);
    const rows = await qb
      .skip((query.page - 1) * query.pageSize)
      .take(query.pageSize)
      .getMany();

    const identityKeys = new Set<string>();
    for (const row of rows) {
      const email = row.email.trim().toLowerCase();
      const login = row.login.trim().toLowerCase();
      if (email) identityKeys.add(email);
      if (login) identityKeys.add(login);
    }

    const appsPool =
      identityKeys.size === 0
        ? []
        : await this.apps
            .createQueryBuilder('a')
            .where('LOWER(TRIM(a.client_email)) IN (:...keys)', {
              keys: [...identityKeys],
            })
            .getMany();

    const items: UserListItemOut[] = rows.map((row) => ({
      ...userOut(row),
      latestAppId: resolveLatestAppIdForUserIdentity(appsPool, row),
    }));

    return buildPaginatedList({
      items,
      total,
      page: query.page,
      pageSize: query.pageSize,
    });
  }

  async listActiveManagerNames(): Promise<ManagerNamesOut> {
    const rows = await this.users.find({
      where: { role: 'manager', active: true },
      order: { name: 'ASC' },
    });
    return {
      names: rows.map((row) => row.name).filter((name) => Boolean(name.trim())),
    };
  }

  async create(body: CreateUserDto): Promise<UserCredentialsOut> {
    const name = (body.name ?? '').trim();
    if (!name) {
      throw new HttpException('Name is required', HttpStatus.BAD_REQUEST);
    }

    const login = (
      (body.login ?? '').trim() ||
      (body.email ?? '').trim() ||
      uid('user')
    ).toLowerCase();

    const existing = await this.users.findOne({ where: { login } });
    if (existing) {
      throw new HttpException('Login already exists', HttpStatus.BAD_REQUEST);
    }

    const password = generateInvitePassword();
    const token = uid('inv');
    const now = new Date();
    const role =
      body.role && (USER_ROLES as readonly string[]).includes(body.role)
        ? body.role
        : DEFAULT_USER_ROLE;

    const row = this.users.create({
      id: uid('u'),
      name,
      login,
      email: ((body.email ?? '').trim().toLowerCase() || login),
      passwordHash: hashPassword(password),
      invitePassword: password,
      role,
      active: true,
      inviteToken: token,
      createdAt: now,
      updatedAt: now,
    });

    await this.users.save(row);
    return {
      user: userOut(row, true),
      password,
      token,
    };
  }

  /**
   * Internal ensure for staff app create (DEC-001 / DEC-006 / REQ-019).
   * Identity must be an email; prefers login match over email when both could hit different rows.
   */
  async ensureClientForIdentity(
    identity: string,
    name: string,
  ): Promise<EnsureClientResult> {
    const normalized = normalizeClientIdentity(identity);
    if (!normalized) {
      throw new HttpException(
        'Client email is required',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (!isValidEmailFormat(normalized)) {
      throw new HttpException(
        'Client identity must be a valid email',
        HttpStatus.BAD_REQUEST,
      );
    }

    const byLogin = await this.users.findOne({ where: { login: normalized } });
    const existing =
      byLogin ??
      (await this.users.findOne({ where: { email: normalized } }));

    if (existing) {
      if (existing.role !== 'client') {
        throw new HttpException(
          'Cannot assign an application to an admin or agent user',
          HttpStatus.BAD_REQUEST,
        );
      }
      return { user: userOut(existing), created: false };
    }

    const trimmedName = (name ?? '').trim();
    if (!trimmedName) {
      throw new HttpException('Name is required', HttpStatus.BAD_REQUEST);
    }

    const password = generateInvitePassword();
    const token = uid('inv');
    const now = new Date();

    const row = this.users.create({
      id: uid('u'),
      name: trimmedName,
      login: normalized,
      email: normalized,
      passwordHash: hashPassword(password),
      invitePassword: password,
      role: DEFAULT_USER_ROLE,
      active: true,
      inviteToken: token,
      createdAt: now,
      updatedAt: now,
    });

    await this.users.save(row);

    return {
      user: userOut(row, true),
      created: true,
      password,
      token,
    };
  }

  async patch(userId: string, body: PatchUserDto): Promise<UserOut> {
    const row = await this.users.findOne({ where: { id: userId } });
    if (!row) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    if (body.active === false && row.role === ADMIN_ROLE) {
      const others = await this.users.count({
        where: {
          role: ADMIN_ROLE,
          active: true,
          id: Not(userId),
        },
      });
      if (others === 0) {
        throw new HttpException(
          'Cannot disable the last admin',
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    if (body.login) {
      const login = body.login.trim().toLowerCase();
      const exists = await this.users.findOne({
        where: { login, id: Not(userId) },
      });
      if (exists) {
        throw new HttpException('Login already exists', HttpStatus.BAD_REQUEST);
      }
      row.login = login;
    }

    if (body.name !== undefined) {
      row.name = body.name;
    }
    if (body.email !== undefined) {
      row.email = body.email;
    }
    if (body.role !== undefined) {
      row.role = body.role;
    }
    if (body.active !== undefined) {
      row.active = body.active;
    }

    row.updatedAt = new Date();
    await this.users.save(row);
    return userOut(row);
  }

  async reissue(userId: string): Promise<UserCredentialsOut> {
    const row = await this.users.findOne({ where: { id: userId } });
    if (!row) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    if (!row.active) {
      throw new HttpException('Enable access first', HttpStatus.BAD_REQUEST);
    }

    const password = generateInvitePassword();
    row.passwordHash = hashPassword(password);
    row.invitePassword = password;
    row.inviteToken = uid('inv');
    row.updatedAt = new Date();
    await this.users.save(row);

    return {
      user: userOut(row, true),
      password,
      token: row.inviteToken,
    };
  }

  async remove(userId: string, actor: User): Promise<{ ok: true }> {
    const row = await this.users.findOne({ where: { id: userId } });
    if (!row) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    if (row.id === actor.id) {
      throw new HttpException('Cannot delete yourself', HttpStatus.BAD_REQUEST);
    }
    if (row.role === ADMIN_ROLE) {
      const others = await this.users.count({
        where: { role: ADMIN_ROLE, id: Not(userId) },
      });
      if (others === 0) {
        throw new HttpException(
          'Cannot delete the last admin',
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    await this.users.remove(row);
    return { ok: true };
  }
}
