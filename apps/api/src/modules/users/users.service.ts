import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';
import { Application } from '../database/entities/application.entity';
import { BalanceTransaction } from '../database/entities/balance-transaction.entity';
import { Client } from '../database/entities/client.entity';
import { User } from '../database/entities/user.entity';
import { userOut } from '../../shared/mappers';
import {
  buildPaginatedList,
  generateInvitePassword,
  hashPassword,
  uid,
} from '../../shared/utils';
import { DEFAULT_USER_ROLE } from '../auth/constants';
import type { IUsersService } from './interfaces';
import type {
  AgentTotalRevenueRow,
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
  assertCanAssignStaffRole,
  assertCanMutateUser,
  buildAgentTotalRevenueMap,
  formatAgentCurrentBalance,
  isValidEmailFormat,
  mapToStaffRole,
  normalizeClientIdentity,
  resolveLatestAppIdForAgent,
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
    @InjectRepository(Client)
    private readonly clients: Repository<Client>,
    @InjectRepository(BalanceTransaction)
    private readonly ledger: Repository<BalanceTransaction>,
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

    const agentIds = rows
      .filter((row): boolean => row.role === 'agent')
      .map((row): string => row.id);

    const agentClients =
      agentIds.length === 0
        ? []
        : await this.clients.find({
            where: { agentId: In(agentIds) },
            select: { id: true, agentId: true },
          });

    const clientIdsByAgent = new Map<string, Set<string>>();
    for (const client of agentClients) {
      const set = clientIdsByAgent.get(client.agentId) ?? new Set<string>();
      set.add(client.id);
      clientIdsByAgent.set(client.agentId, set);
    }

    const allAgentClientIds = agentClients.map((client): string => client.id);
    const agentAppsPool =
      allAgentClientIds.length === 0
        ? []
        : await this.apps.find({
            where: { clientId: In(allAgentClientIds) },
          });

    const identityKeys = new Set<string>();
    for (const row of rows) {
      if (row.role === 'agent') {
        continue;
      }
      const email = row.email.trim().toLowerCase();
      const login = row.login.trim().toLowerCase();
      if (email) identityKeys.add(email);
      if (login) identityKeys.add(login);
    }

    const identityAppsPool =
      identityKeys.size === 0
        ? []
        : await this.apps
            .createQueryBuilder('a')
            .where('LOWER(TRIM(a.client_email)) IN (:...keys)', {
              keys: [...identityKeys],
            })
            .getMany();

    const totalRevenueByAgent = await this.loadAgentTotalRevenues(agentIds);

    const items: UserListItemOut[] = rows.map((row): UserListItemOut => {
      if (row.role === 'agent') {
        const clientIds =
          clientIdsByAgent.get(row.id) ?? new Set<string>();
        return {
          ...userOut(row),
          latestAppId: resolveLatestAppIdForAgent(agentAppsPool, clientIds),
          clientsCount: clientIds.size,
          currentBalance: formatAgentCurrentBalance(row.balance),
          totalRevenue: totalRevenueByAgent.get(row.id) ?? '0.00',
        };
      }

      return {
        ...userOut(row),
        latestAppId: resolveLatestAppIdForUserIdentity(
          identityAppsPool,
          row,
        ),
        clientsCount: null,
        currentBalance: null,
        totalRevenue: null,
      };
    });

    return buildPaginatedList({
      items,
      total,
      page: query.page,
      pageSize: query.pageSize,
    });
  }

  async listActiveManagerNames(): Promise<ManagerNamesOut> {
    // FR-12: former managers are `agent` under StaffRole.
    const rows = await this.users.find({
      where: { role: 'agent', active: true },
      order: { name: 'ASC' },
    });
    return {
      names: rows.map((row) => row.name).filter((name) => Boolean(name.trim())),
    };
  }

  async create(
    body: CreateUserDto,
    actor: User,
  ): Promise<UserCredentialsOut> {
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

    const role =
      body.role !== undefined && String(body.role).trim() !== ''
        ? mapToStaffRole(body.role)
        : DEFAULT_USER_ROLE;
    const superadminCount = await this.users.count({
      where: { role: 'superadmin' },
    });
    assertCanAssignStaffRole({
      actorRole: actor.role,
      targetRole: role,
      superadminCount,
    });

    const password = generateInvitePassword();
    const token = uid('inv');
    const now = new Date();

    const row = this.users.create({
      id: uid('u'),
      name,
      login,
      email: ((body.email ?? '').trim().toLowerCase() || login),
      passwordHash: hashPassword(password),
      invitePassword: password,
      role,
      balance: '0',
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
      // T2/T8 interim: only reuse agent-shaped rows; reject admin/superadmin.
      if (existing.role === 'admin' || existing.role === 'superadmin') {
        throw new HttpException(
          'Cannot assign an application to an admin or superadmin user',
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
      role: mapToStaffRole(DEFAULT_USER_ROLE),
      balance: '0',
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

  async patch(
    userId: string,
    body: PatchUserDto,
    actor: User,
  ): Promise<UserOut> {
    const row = await this.users.findOne({ where: { id: userId } });
    if (!row) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    assertCanMutateUser({
      actorRole: actor.role,
      targetRole: row.role,
    });

    if (body.active === false && row.role === 'admin') {
      const others = await this.users.count({
        where: {
          role: 'admin',
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
      const nextRole = mapToStaffRole(body.role);
      const superadminCount = await this.users.count({
        where: { role: 'superadmin' },
      });
      assertCanAssignStaffRole({
        actorRole: actor.role,
        targetRole: nextRole,
        superadminCount,
        currentRole: row.role,
      });
      if (row.role === 'superadmin' && nextRole !== 'superadmin') {
        const otherSuperadmins = await this.users.count({
          where: { role: 'superadmin', id: Not(userId) },
        });
        if (otherSuperadmins === 0) {
          throw new HttpException(
            'Cannot demote the last superadmin',
            HttpStatus.BAD_REQUEST,
          );
        }
      }
      row.role = nextRole;
    }
    if (body.active !== undefined) {
      row.active = body.active;
    }

    row.updatedAt = new Date();
    await this.users.save(row);
    return userOut(row);
  }

  async reissue(
    userId: string,
    actor: User,
  ): Promise<UserCredentialsOut> {
    const row = await this.users.findOne({ where: { id: userId } });
    if (!row) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    assertCanMutateUser({
      actorRole: actor.role,
      targetRole: row.role,
    });
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

    assertCanMutateUser({
      actorRole: actor.role,
      targetRole: row.role,
    });

    if (row.role === 'admin') {
      const others = await this.users.count({
        where: {
          role: 'admin',
          id: Not(userId),
        },
      });
      if (others === 0) {
        throw new HttpException(
          'Cannot delete the last admin',
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    if (row.role === 'superadmin') {
      const others = await this.users.count({
        where: {
          role: 'superadmin',
          id: Not(userId),
        },
      });
      if (others === 0) {
        throw new HttpException(
          'Cannot delete the last superadmin',
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    await this.users.remove(row);
    return { ok: true };
  }

  private async loadAgentTotalRevenues(
    agentIds: string[],
  ): Promise<Map<string, string>> {
    if (agentIds.length === 0) {
      return buildAgentTotalRevenueMap([], []);
    }

    const rows = await this.ledger
      .createQueryBuilder('bt')
      .select('bt.agent_id', 'agentId')
      .addSelect('COALESCE(SUM(ABS(bt.amount)), 0)', 'total')
      .where('bt.agent_id IN (:...agentIds)', { agentIds })
      .andWhere('bt.type = :type', { type: 'client_creation_debit' })
      .groupBy('bt.agent_id')
      .getRawMany<AgentTotalRevenueRow>();

    return buildAgentTotalRevenueMap(agentIds, rows);
  }
}
