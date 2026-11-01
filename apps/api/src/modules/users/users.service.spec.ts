import { HttpException, HttpStatus } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import type { StaffRole } from '@vises/contracts';
import { Application } from '../database/entities/application.entity';
import { User } from '../database/entities/user.entity';
import { UsersService } from './users.service';

const makeUser = (partial: Partial<User> & Pick<User, 'id' | 'role'>): User =>
  ({
    name: partial.name ?? 'User',
    login: partial.login ?? partial.id,
    email: partial.email ?? `${partial.id}@example.com`,
    passwordHash: partial.passwordHash ?? 'hash',
    invitePassword: partial.invitePassword ?? '',
    balance: partial.balance ?? '0',
    active: partial.active ?? true,
    inviteToken: partial.inviteToken ?? `tok-${partial.id}`,
    createdAt: partial.createdAt ?? new Date('2026-01-01T00:00:00Z'),
    updatedAt: partial.updatedAt ?? new Date('2026-01-01T00:00:00Z'),
    ...partial,
  }) as User;

describe('UsersService ACL matrix (T5 / AC-2 / FR-1 / NFR-6)', (): void => {
  const createUsersRepo = (): {
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    remove: jest.Mock;
    count: jest.Mock;
    find: jest.Mock;
    createQueryBuilder: jest.Mock;
  } => ({
    findOne: jest.fn(),
    create: jest.fn((partial: Partial<User>): User => partial as User),
    save: jest.fn(async (row: User): Promise<User> => row),
    remove: jest.fn(async (row: User): Promise<User> => row),
    count: jest.fn(),
    find: jest.fn(),
    createQueryBuilder: jest.fn(),
  });

  const createModule = async (
    usersRepo: ReturnType<typeof createUsersRepo>,
  ): Promise<UsersService> => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: usersRepo },
        {
          provide: getRepositoryToken(Application),
          useValue: { createQueryBuilder: jest.fn() },
        },
      ],
    }).compile();
    return moduleRef.get(UsersService);
  };

  const adminActor = makeUser({ id: 'admin-1', role: 'admin' });
  const superadminActor = makeUser({
    id: 'sa-1',
    role: 'superadmin',
  });

  it('admin cannot create admin (forbidden_role)', async (): Promise<void> => {
    const usersRepo = createUsersRepo();
    usersRepo.findOne.mockResolvedValue(null);
    usersRepo.count.mockResolvedValue(1);
    const service = await createModule(usersRepo);

    try {
      await service.create({ name: 'Other Admin', role: 'admin' }, adminActor);
      fail('expected throw');
    } catch (error: unknown) {
      expect(error).toBeInstanceOf(HttpException);
      if (error instanceof HttpException) {
        expect(error.getStatus()).toBe(HttpStatus.FORBIDDEN);
        expect(error.getResponse()).toEqual({ detail: 'forbidden_role' });
      }
    }
    expect(usersRepo.save).not.toHaveBeenCalled();
  });

  it('superadmin can create admin', async (): Promise<void> => {
    const usersRepo = createUsersRepo();
    usersRepo.findOne.mockResolvedValue(null);
    usersRepo.count.mockResolvedValue(1);
    const service = await createModule(usersRepo);

    const result = await service.create(
      { name: 'New Admin', role: 'admin', login: 'new-admin' },
      superadminActor,
    );
    expect(result.user.role).toBe('admin');
    expect(usersRepo.save).toHaveBeenCalled();
  });

  it('creating superadmin via API is forbidden when none exists', async (): Promise<void> => {
    const usersRepo = createUsersRepo();
    usersRepo.findOne.mockResolvedValue(null);
    usersRepo.count.mockResolvedValue(0);
    const service = await createModule(usersRepo);

    try {
      await service.create(
        { name: 'SA', role: 'superadmin' },
        superadminActor,
      );
      fail('expected throw');
    } catch (error: unknown) {
      expect(error).toBeInstanceOf(HttpException);
      if (error instanceof HttpException) {
        expect(error.getStatus()).toBe(HttpStatus.FORBIDDEN);
        expect(error.getResponse()).toEqual({ detail: 'forbidden_role' });
      }
    }
  });

  it('creating second superadmin returns superadmin_exists', async (): Promise<void> => {
    const usersRepo = createUsersRepo();
    usersRepo.findOne.mockResolvedValue(null);
    usersRepo.count.mockResolvedValue(1);
    const service = await createModule(usersRepo);

    try {
      await service.create(
        { name: 'SA2', role: 'superadmin' },
        superadminActor,
      );
      fail('expected throw');
    } catch (error: unknown) {
      expect(error).toBeInstanceOf(HttpException);
      if (error instanceof HttpException) {
        expect(error.getStatus()).toBe(HttpStatus.CONFLICT);
        expect(error.getResponse()).toEqual({ detail: 'superadmin_exists' });
      }
    }
  });

  it('admin may create agent (FR-12 legacy manager→agent)', async (): Promise<void> => {
    const usersRepo = createUsersRepo();
    usersRepo.findOne.mockResolvedValue(null);
    usersRepo.count.mockResolvedValue(1);
    const service = await createModule(usersRepo);

    const result = await service.create(
      { name: 'Agent', role: 'manager', login: 'agent-1' },
      adminActor,
    );
    expect(result.user.role).toBe('agent' as StaffRole);
  });

  it('admin cannot patch or delete another admin', async (): Promise<void> => {
    const usersRepo = createUsersRepo();
    const target = makeUser({ id: 'admin-2', role: 'admin' });
    usersRepo.findOne.mockResolvedValue(target);
    const service = await createModule(usersRepo);

    try {
      await service.patch('admin-2', { name: 'Nope' }, adminActor);
      fail('expected patch throw');
    } catch (error: unknown) {
      expect(error).toBeInstanceOf(HttpException);
      if (error instanceof HttpException) {
        expect(error.getResponse()).toEqual({ detail: 'forbidden_role' });
      }
    }

    try {
      await service.remove('admin-2', adminActor);
      fail('expected remove throw');
    } catch (error: unknown) {
      expect(error).toBeInstanceOf(HttpException);
      if (error instanceof HttpException) {
        expect(error.getResponse()).toEqual({ detail: 'forbidden_role' });
      }
    }
  });

  it('admin cannot patch or delete superadmin', async (): Promise<void> => {
    const usersRepo = createUsersRepo();
    const target = makeUser({ id: 'sa-1', role: 'superadmin' });
    usersRepo.findOne.mockResolvedValue(target);
    const service = await createModule(usersRepo);

    try {
      await service.patch('sa-1', { active: false }, adminActor);
      fail('expected patch throw');
    } catch (error: unknown) {
      expect(error).toBeInstanceOf(HttpException);
      if (error instanceof HttpException) {
        expect(error.getResponse()).toEqual({ detail: 'forbidden_role' });
      }
    }

    try {
      await service.remove('sa-1', adminActor);
      fail('expected remove throw');
    } catch (error: unknown) {
      expect(error).toBeInstanceOf(HttpException);
      if (error instanceof HttpException) {
        expect(error.getResponse()).toEqual({ detail: 'forbidden_role' });
      }
    }
  });

  it('superadmin can patch and delete admin', async (): Promise<void> => {
    const usersRepo = createUsersRepo();
    const target = makeUser({ id: 'admin-2', role: 'admin', name: 'Old' });
    usersRepo.findOne.mockResolvedValue(target);
    usersRepo.count.mockResolvedValue(1);
    const service = await createModule(usersRepo);

    const patched = await service.patch(
      'admin-2',
      { name: 'Renamed' },
      superadminActor,
    );
    expect(patched.name).toBe('Renamed');

    usersRepo.findOne.mockResolvedValue(
      makeUser({ id: 'admin-2', role: 'admin' }),
    );
    await expect(service.remove('admin-2', superadminActor)).resolves.toEqual({
      ok: true,
    });
  });

  it('admin can patch agent', async (): Promise<void> => {
    const usersRepo = createUsersRepo();
    const target = makeUser({ id: 'agent-1', role: 'agent', name: 'A' });
    usersRepo.findOne.mockResolvedValue(target);
    const service = await createModule(usersRepo);

    const patched = await service.patch(
      'agent-1',
      { name: 'Agent Renamed' },
      adminActor,
    );
    expect(patched.name).toBe('Agent Renamed');
  });

  it('listActiveManagerNames returns active agents only (FR-12)', async (): Promise<void> => {
    const usersRepo = createUsersRepo();
    usersRepo.find.mockResolvedValue([
      makeUser({ id: 'a1', role: 'agent', name: 'Agent A', active: true }),
    ]);
    const service = await createModule(usersRepo);

    const out = await service.listActiveManagerNames();
    expect(out.names).toEqual(['Agent A']);
    expect(usersRepo.find).toHaveBeenCalledWith({
      where: { role: 'agent', active: true },
      order: { name: 'ASC' },
    });
  });
});
