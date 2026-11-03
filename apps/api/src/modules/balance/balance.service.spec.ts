import { HttpException, HttpStatus } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { getDataSourceToken, getRepositoryToken } from '@nestjs/typeorm';
import type { EntityManager } from 'typeorm';
import { APP_LOGGER } from '../logger/constants';
import { BalanceTransaction } from '../database/entities/balance-transaction.entity';
import { User } from '../database/entities/user.entity';
import { BalanceAuditService } from './balance-audit.service';
import { BalanceService } from './balance.service';

describe('BalanceService (AC-8 / FR-4 / NFR-1 / NFR-4)', (): void => {
  const agent: User = Object.assign(new User(), {
    id: 'agent-1',
    name: 'Agent',
    login: 'agent1',
    email: 'a@example.com',
    passwordHash: 'x',
    invitePassword: '',
    role: 'agent' as const,
    balance: '100.00',
    active: true,
    inviteToken: 'tok',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  });

  const admin: User = Object.assign(new User(), {
    id: 'admin-1',
    name: 'Admin',
    login: 'admin1',
    email: 'admin@example.com',
    passwordHash: 'x',
    invitePassword: '',
    role: 'admin' as const,
    balance: null,
    active: true,
    inviteToken: 'tok-a',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  });

  const ledgerFindAndCount = jest.fn();
  const loggerLog = jest.fn();
  let lockedUser: User;
  let savedUsers: User[];
  let savedLedger: BalanceTransaction[];

  /**
   * Typed stub covering the EntityManager surface BalanceService reads
   * (same harness style as settings.controller.spec.ts / roles.guard.spec.ts).
   */
  type LockedQueryBuilderStub = {
    setLock: jest.Mock;
    where: jest.Mock;
    getOne: jest.Mock<Promise<User | null>, []>;
  };

  type EntityManagerStub = {
    createQueryBuilder: jest.Mock<LockedQueryBuilderStub, unknown[]>;
    save: jest.Mock<Promise<User | BalanceTransaction>, unknown[]>;
    create: jest.Mock<BalanceTransaction, unknown[]>;
  };

  const isUserEntity = (entity: unknown): entity is User => {
    return entity instanceof User;
  };

  const isBalanceTransactionEntity = (
    entity: unknown,
  ): entity is BalanceTransaction => {
    return entity instanceof BalanceTransaction;
  };

  const createManager = (): EntityManager => {
    const qb: LockedQueryBuilderStub = {
      setLock: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getOne: jest.fn(
        async (): Promise<User | null> => lockedUser,
      ),
    };
    const stub: EntityManagerStub = {
      createQueryBuilder: jest.fn(
        (..._args: unknown[]): LockedQueryBuilderStub => qb,
      ),
      save: jest.fn(
        async (
          ...args: unknown[]
        ): Promise<User | BalanceTransaction> => {
          const entity = args.length >= 2 ? args[1] : args[0];
          if (isUserEntity(entity)) {
            savedUsers.push(entity);
            return entity;
          }
          if (isBalanceTransactionEntity(entity)) {
            savedLedger.push(entity);
            return entity;
          }
          throw new Error('unexpected entity passed to manager.save');
        },
      ),
      create: jest.fn(
        (...args: unknown[]): BalanceTransaction => {
          const data =
            args.length >= 2 && typeof args[1] === 'object' && args[1] !== null
              ? (args[1] as Partial<BalanceTransaction>)
              : {};
          return Object.assign(new BalanceTransaction(), data);
        },
      ),
    };
    // EntityManager is a class with private fields, so a partial stub cannot
    // structurally overlap; @ts-expect-error is the conventions-approved
    // escape (no `as unknown as` / `as any`). Same harness intent as
    // settings.controller.spec.ts / roles.guard.spec.ts.
    // @ts-expect-error intentional EntityManager unit-test harness
    return stub as EntityManager;
  };

  const createService = async (): Promise<BalanceService> => {
    lockedUser = Object.assign(new User(), { ...agent, balance: '100.00' });
    savedUsers = [];
    savedLedger = [];
    ledgerFindAndCount.mockReset();
    loggerLog.mockReset();

    const manager = createManager();
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        BalanceService,
        BalanceAuditService,
        {
          provide: getDataSourceToken(),
          useValue: {
            transaction: jest
              .fn()
              .mockImplementation(
                async <T>(
                  fn: (m: EntityManager) => Promise<T>,
                ): Promise<T> => fn(manager),
              ),
          },
        },
        {
          provide: getRepositoryToken(BalanceTransaction),
          useValue: { findAndCount: ledgerFindAndCount },
        },
        {
          provide: APP_LOGGER,
          useValue: { log: loggerLog },
        },
      ],
    }).compile();

    return moduleRef.get(BalanceService);
  };

  it('top-up appends ledger and increases balance', async (): Promise<void> => {
    const service = await createService();
    const dto = await service.topUp('agent-1', { amount: '50.00' }, admin);

    expect(dto.type).toBe('top_up');
    expect(dto.amount).toBe('50.00');
    expect(dto.resultingBalance).toBe('150.00');
    expect(dto.reason).toBe('top_up');
    expect(dto.clientId).toBeNull();
    expect(dto.agentId).toBe('agent-1');
    expect(dto.actorId).toBe('admin-1');
    expect(savedUsers[0]?.balance).toBe('150.00');
    expect(savedLedger).toHaveLength(1);
  });

  it('top-up rejects non-positive amount with invalid_amount', async (): Promise<void> => {
    const service = await createService();
    expect.assertions(2);
    try {
      await service.topUp('agent-1', { amount: '0' }, admin);
    } catch (error: unknown) {
      expect(error).toBeInstanceOf(HttpException);
      if (error instanceof HttpException) {
        expect(error.getResponse()).toEqual({ detail: 'invalid_amount' });
      }
    }
  });

  it('top-up of non-agent returns not_agent', async (): Promise<void> => {
    const service = await createService();
    lockedUser = Object.assign(new User(), { ...admin });
    expect.assertions(2);
    try {
      await service.topUp('admin-1', { amount: '10.00' }, admin);
    } catch (error: unknown) {
      expect(error).toBeInstanceOf(HttpException);
      if (error instanceof HttpException) {
        expect(error.getResponse()).toEqual({ detail: 'not_agent' });
      }
    }
  });

  it('adjust requires non-empty reason and appends ledger + Winston audit', async (): Promise<void> => {
    const service = await createService();
    const dto = await service.adjust(
      'agent-1',
      { amount: '-25.50', reason: '  penalty  ' },
      admin,
    );

    expect(dto.type).toBe('adjust');
    expect(dto.amount).toBe('-25.50');
    expect(dto.reason).toBe('penalty');
    expect(dto.resultingBalance).toBe('74.50');
    expect(loggerLog).toHaveBeenCalledTimes(1);
    const payload = JSON.parse(String(loggerLog.mock.calls[0][0])) as {
      type: string;
      reason: string;
      amount: string;
    };
    expect(payload.type).toBe('balance_adjust');
    expect(payload.reason).toBe('penalty');
    expect(payload.amount).toBe('-25.50');
  });

  it('adjust whitespace reason → reason_required', async (): Promise<void> => {
    const service = await createService();
    expect.assertions(2);
    try {
      await service.adjust(
        'agent-1',
        { amount: '10.00', reason: ' \t ' },
        admin,
      );
    } catch (error: unknown) {
      expect(error).toBeInstanceOf(HttpException);
      if (error instanceof HttpException) {
        expect(error.getResponse()).toEqual({ detail: 'reason_required' });
      }
    }
  });

  it('listTransactions returns paginated newest-first ledger rows (DEC-P4)', async (): Promise<void> => {
    const service = await createService();
    const older = Object.assign(new BalanceTransaction(), {
      id: 'btx-1',
      agentId: 'agent-1',
      actorId: 'admin-1',
      type: 'top_up' as const,
      amount: '100.00',
      reason: 'top_up',
      resultingBalance: '100.00',
      clientId: null,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
    });
    const newer = Object.assign(new BalanceTransaction(), {
      id: 'btx-2',
      agentId: 'agent-1',
      actorId: 'admin-1',
      type: 'adjust' as const,
      amount: '10.00',
      reason: 'bonus',
      resultingBalance: '110.00',
      clientId: null,
      createdAt: new Date('2026-01-02T00:00:00.000Z'),
    });
    ledgerFindAndCount.mockResolvedValue([[newer, older], 2]);

    const result = await service.listTransactions('agent-1', admin, {
      page: 1,
      pageSize: 20,
    });
    expect(ledgerFindAndCount).toHaveBeenCalledWith({
      where: { agentId: 'agent-1' },
      order: { createdAt: 'DESC' },
      skip: 0,
      take: 20,
    });
    expect(result).toMatchObject({
      total: 2,
      page: 1,
      pageSize: 20,
    });
    expect(result.items.map((r) => r.id)).toEqual(['btx-2', 'btx-1']);
  });

  it('debitWithLock uses FOR UPDATE path and appends client_creation_debit', async (): Promise<void> => {
    const service = await createService();
    const manager = createManager();
    lockedUser = Object.assign(new User(), { ...agent, balance: '180.00' });

    const dto = await service.debitWithLock(manager, {
      agentId: 'agent-1',
      actorId: 'agent-1',
      amount: '180.00',
      clientId: 'cli-1',
      reason: 'client_create',
    });

    expect(manager.createQueryBuilder).toHaveBeenCalled();
    const qb = (manager.createQueryBuilder as jest.Mock).mock.results[0]
      .value as { setLock: jest.Mock };
    expect(qb.setLock).toHaveBeenCalledWith('pessimistic_write');
    expect(dto.type).toBe('client_creation_debit');
    expect(dto.amount).toBe('-180.00');
    expect(dto.resultingBalance).toBe('0.00');
    expect(dto.clientId).toBe('cli-1');
  });

  it('debitWithLock rejects overdraft with insufficient_balance', async (): Promise<void> => {
    const service = await createService();
    const manager = createManager();
    lockedUser = Object.assign(new User(), { ...agent, balance: '100.00' });

    expect.assertions(3);
    try {
      await service.debitWithLock(manager, {
        agentId: 'agent-1',
        actorId: 'agent-1',
        amount: '180.00',
        clientId: 'cli-1',
        reason: 'client_create',
      });
    } catch (error: unknown) {
      expect(error).toBeInstanceOf(HttpException);
      if (error instanceof HttpException) {
        expect(error.getStatus()).toBe(HttpStatus.CONFLICT);
        expect(error.getResponse()).toEqual({
          detail: 'insufficient_balance',
        });
      }
    }
  });
});
