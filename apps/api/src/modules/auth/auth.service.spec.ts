import { HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import type { StaffRole, UserMeDto } from '@vises/contracts';
import { User } from '../database/entities/user.entity';
import { checkPassword, hashPassword } from '../../shared/utils';
import { AuthService } from './auth.service';
import type { RegisterDto } from './dto/register.dto';
import { JwtTokenService } from './jwt.service';

describe('AuthService (T4 / FR-2 / §6.1)', (): void => {
  const makeToken = jest.fn(
    (user: User): string => `token:${user.id}:${user.role}`,
  );

  const createUsersRepo = (): {
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    createQueryBuilder: jest.Mock;
  } => {
    const findOne = jest.fn();
    const create = jest.fn(
      (partial: Partial<User>): User => partial as User,
    );
    const save = jest.fn(async (row: User): Promise<User> => row);
    return {
      findOne,
      create,
      save,
      createQueryBuilder: jest.fn(),
    };
  };

  const createModule = async (
    usersRepo: ReturnType<typeof createUsersRepo>,
  ): Promise<{ service: AuthService; moduleRef: TestingModule }> => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: usersRepo,
        },
        {
          provide: JwtTokenService,
          useValue: { makeToken, readToken: jest.fn() },
        },
        {
          provide: ConfigService,
          useValue: {
            get: (key: string): string => {
              if (key === 'DEMO_AUTH_ENABLED') {
                return 'true';
              }
              if (key === 'NODE_ENV') {
                return 'development';
              }
              return '';
            },
          },
        },
      ],
    }).compile();

    return {
      service: moduleRef.get(AuthService),
      moduleRef,
    };
  };

  beforeEach((): void => {
    makeToken.mockClear();
  });

  it('POST /auth/register creates an active agent with JWT StaffRole claim and no client/app writes', async (): Promise<void> => {
    const usersRepo = createUsersRepo();
    usersRepo.findOne.mockResolvedValue(null);
    const { service, moduleRef } = await createModule(usersRepo);

    const body: RegisterDto = {
      login: 'agent.one',
      password: 'secret-pass',
      email: 'agent.one@example.com',
    };

    const session = await service.register(body);

    expect(usersRepo.save).toHaveBeenCalledTimes(1);
    const saved = usersRepo.save.mock.calls[0][0] as User;
    expect(saved.role).toBe('agent');
    expect(saved.active).toBe(true);
    expect(saved.balance).toBe('0');
    expect(saved.name).toBe('agent.one');
    expect(saved.firstName).toBeNull();
    expect(saved.lastName).toBeNull();
    expect(checkPassword('secret-pass', saved.passwordHash)).toBe(true);
    expect(session.user.role).toBe('agent');
    expect(session.user.firstName).toBeNull();
    expect(session.user.lastName).toBeNull();
    expect(session.token).toBe(`token:${saved.id}:agent`);
    expect(makeToken).toHaveBeenCalledWith(
      expect.objectContaining({ role: 'agent' satisfies StaffRole }),
    );
    // AuthService only injects User repository — registration must not touch clients/apps.
    expect(moduleRef.get(getRepositoryToken(User))).toBe(usersRepo);

    await moduleRef.close();
  });

  it('POST /auth/register persists optional firstName/lastName and derives name', async (): Promise<void> => {
    const usersRepo = createUsersRepo();
    usersRepo.findOne.mockResolvedValue(null);
    const { service, moduleRef } = await createModule(usersRepo);

    const body: RegisterDto = {
      login: 'agent.named',
      email: 'named@example.com',
      password: 'secret-pass',
      firstName: ' Ada ',
      lastName: ' Lovelace ',
    };

    const session = await service.register(body);
    const saved = usersRepo.save.mock.calls[0][0] as User;

    expect(saved.firstName).toBe('Ada');
    expect(saved.lastName).toBe('Lovelace');
    expect(saved.name).toBe('Ada Lovelace');
    expect(session.user.firstName).toBe('Ada');
    expect(session.user.lastName).toBe('Lovelace');
    expect(session.user.name).toBe('Ada Lovelace');

    await moduleRef.close();
  });

  it('rejects role override other than agent on register', async (): Promise<void> => {
    const usersRepo = createUsersRepo();
    const { service, moduleRef } = await createModule(usersRepo);

    let caught: HttpException | undefined;
    try {
      await service.register({
        login: 'hacker',
        email: 'hacker@example.com',
        password: 'x',
        role: 'admin',
      });
    } catch (err: unknown) {
      caught = err as HttpException;
    }

    expect(caught).toBeInstanceOf(HttpException);
    expect(caught?.getStatus()).toBe(HttpStatus.BAD_REQUEST);
    expect(usersRepo.save).not.toHaveBeenCalled();
    await moduleRef.close();
  });

  it('login accepts identifier matching login OR email', async (): Promise<void> => {
    const usersRepo = createUsersRepo();
    const user = {
      id: 'u-agent',
      name: 'Agent',
      firstName: null,
      lastName: null,
      login: 'agent.login',
      email: 'agent@example.com',
      passwordHash: hashPassword('secret-pass'),
      invitePassword: '',
      role: 'agent' as const,
      balance: '0',
      active: true,
      inviteToken: 'inv-1',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    } satisfies User;

    const getOne = jest.fn().mockResolvedValue(user);
    const where = jest.fn().mockReturnValue({ getOne });
    usersRepo.createQueryBuilder.mockReturnValue({ where });

    const { service, moduleRef } = await createModule(usersRepo);

    const byLogin = await service.login('agent.login', 'secret-pass');
    expect(where).toHaveBeenCalledWith(
      'LOWER(u.login) = :needle OR LOWER(u.email) = :needle',
      { needle: 'agent.login' },
    );
    expect(byLogin.token).toBe('token:u-agent:agent');

    where.mockClear();
    getOne.mockClear();
    getOne.mockResolvedValue(user);

    const byEmail = await service.login('agent@example.com', 'secret-pass');
    expect(where).toHaveBeenCalledWith(
      'LOWER(u.login) = :needle OR LOWER(u.email) = :needle',
      { needle: 'agent@example.com' },
    );
    expect(byEmail.token).toBe('token:u-agent:agent');

    await moduleRef.close();
  });

  it('GET /auth/me returns UserMeDto with agent balance string and null for others', async (): Promise<void> => {
    const usersRepo = createUsersRepo();
    const { service, moduleRef } = await createModule(usersRepo);

    const agent = {
      id: 'u-agent',
      name: 'Agent',
      firstName: 'Ada',
      lastName: 'Lovelace',
      login: 'agent',
      email: 'a@example.com',
      passwordHash: 'x',
      invitePassword: 'invite-secret',
      role: 'agent' as const,
      balance: '360.00',
      active: true,
      inviteToken: 'inv-1',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    } satisfies User;

    const admin = {
      ...agent,
      id: 'u-admin',
      login: 'admin',
      role: 'admin' as const,
      balance: '0',
      firstName: null,
      lastName: null,
    } satisfies User;

    const superadmin = {
      ...agent,
      id: 'u-sa',
      login: 'super',
      role: 'superadmin' as const,
      balance: '99.00',
      firstName: null,
      lastName: null,
    } satisfies User;

    const agentMe = service.me(agent);
    expect(agentMe).toEqual({
      id: 'u-agent',
      email: 'a@example.com',
      role: 'agent',
      active: true,
      balance: '360.00',
      firstName: 'Ada',
      lastName: 'Lovelace',
    } satisfies UserMeDto);
    expect(typeof agentMe.balance).toBe('string');
    expect(agentMe).not.toHaveProperty('name');
    expect(agentMe).not.toHaveProperty('login');
    expect(agentMe).not.toHaveProperty('password');
    expect(agentMe).not.toHaveProperty('passwordHash');
    expect(agentMe).not.toHaveProperty('invitePassword');
    expect(agentMe).not.toHaveProperty('inviteToken');

    const adminMe = service.me(admin);
    expect(adminMe.role).toBe('admin');
    expect(adminMe.balance).toBeNull();
    expect(adminMe.firstName).toBeNull();
    expect(adminMe.lastName).toBeNull();

    const superadminMe = service.me(superadmin);
    expect(superadminMe.role).toBe('superadmin');
    expect(superadminMe.balance).toBeNull();

    await moduleRef.close();
  });

  it('demo accepts only StaffRole values and issues JWT with that role', async (): Promise<void> => {
    const usersRepo = createUsersRepo();
    const user = {
      id: 'u-sa',
      name: 'Super',
      firstName: null,
      lastName: null,
      login: 'super',
      email: 's@example.com',
      passwordHash: 'x',
      invitePassword: '',
      role: 'superadmin' as const,
      balance: null,
      active: true,
      inviteToken: 'inv-sa',
      createdAt: new Date(),
      updatedAt: new Date(),
    } satisfies User;
    usersRepo.findOne.mockResolvedValue(user);
    const { service, moduleRef } = await createModule(usersRepo);

    const session = await service.demo('superadmin');
    expect(session.token).toBe('token:u-sa:superadmin');
    expect(makeToken).toHaveBeenCalledWith(
      expect.objectContaining({ role: 'superadmin' }),
    );

    await moduleRef.close();
  });
});
