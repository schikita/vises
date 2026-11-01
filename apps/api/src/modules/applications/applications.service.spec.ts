import { HttpException, HttpStatus } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { getDataSourceToken, getRepositoryToken } from '@nestjs/typeorm';
import type { EntityManager, Repository } from 'typeorm';
import { ApplicationStatusHistory } from '../database/entities/application-status-history.entity';
import { Application } from '../database/entities/application.entity';
import { Client } from '../database/entities/client.entity';
import { ApplicationsService } from './applications.service';
import { VISA_CENTER_MONITOR_ACTOR } from './constants';

describe('ApplicationsService (AC-12 / AC-13 / AC-14 / FR-7.4 / T14.2)', (): void => {
  const ownerAgentId = 'agent-1';
  const otherAgentId = 'agent-2';

  let lockedApp: Application | null;
  let clientRow: Client | null;
  let savedApps: Application[];
  let savedHistory: ApplicationStatusHistory[];
  let historyRows: ApplicationStatusHistory[];
  let applicationsFindOne: jest.Mock;
  let clientsFindOne: jest.Mock;
  let historyFind: jest.Mock;

  type LockedQueryBuilderStub = {
    setLock: jest.Mock;
    where: jest.Mock;
    getOne: jest.Mock<Promise<Application | null>, []>;
  };

  type EntityManagerStub = {
    createQueryBuilder: jest.Mock<LockedQueryBuilderStub, unknown[]>;
    findOne: jest.Mock<Promise<Client | null>, unknown[]>;
    save: jest.Mock<
      Promise<Application | ApplicationStatusHistory>,
      unknown[]
    >;
    create: jest.Mock<ApplicationStatusHistory, unknown[]>;
  };

  const makeApp = (status: Application['status']): Application =>
    Object.assign(new Application(), {
      id: 'app-1',
      clientId: 'cli-1',
      code: 'A1',
      clientEmail: '',
      portalFormEmail: null,
      status,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    });

  const makeClient = (agentId: string): Client =>
    Object.assign(new Client(), {
      id: 'cli-1',
      agentId,
    });

  const makeHistory = (
    partial: Partial<ApplicationStatusHistory>,
  ): ApplicationStatusHistory =>
    Object.assign(new ApplicationStatusHistory(), {
      id: 'ash-1',
      applicationId: 'app-1',
      fromStatus: 'pending',
      toStatus: 'booked',
      actorId: 'admin-1',
      actorRole: 'admin',
      trigger: null,
      createdAt: new Date('2026-01-02T00:00:00.000Z'),
      ...partial,
    });

  const isApplication = (entity: unknown): entity is Application =>
    entity instanceof Application;

  const isHistory = (entity: unknown): entity is ApplicationStatusHistory =>
    entity instanceof ApplicationStatusHistory;

  const createManager = (): EntityManager => {
    const qb: LockedQueryBuilderStub = {
      setLock: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getOne: jest.fn(async (): Promise<Application | null> => lockedApp),
    };
    const stub: EntityManagerStub = {
      createQueryBuilder: jest.fn(
        (..._args: unknown[]): LockedQueryBuilderStub => qb,
      ),
      findOne: jest.fn(async (): Promise<Client | null> => clientRow),
      save: jest.fn(
        async (
          ...args: unknown[]
        ): Promise<Application | ApplicationStatusHistory> => {
          const entity = args.length >= 2 ? args[1] : args[0];
          if (isApplication(entity)) {
            savedApps.push(entity);
            lockedApp = entity;
            return entity;
          }
          if (isHistory(entity)) {
            savedHistory.push(entity);
            return entity;
          }
          throw new Error('unexpected entity passed to manager.save');
        },
      ),
      create: jest.fn(
        (...args: unknown[]): ApplicationStatusHistory => {
          const data =
            args.length >= 2 && typeof args[1] === 'object' && args[1] !== null
              ? (args[1] as Partial<ApplicationStatusHistory>)
              : {};
          return Object.assign(new ApplicationStatusHistory(), data);
        },
      ),
    };
    // @ts-expect-error intentional EntityManager unit-test harness
    return stub as EntityManager;
  };

  const createService = async (): Promise<ApplicationsService> => {
    const manager = createManager();
    applicationsFindOne = jest.fn(
      async (): Promise<Application | null> => lockedApp,
    );
    clientsFindOne = jest.fn(async (): Promise<Client | null> => clientRow);
    historyFind = jest.fn(
      async (): Promise<ApplicationStatusHistory[]> => historyRows,
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationsService,
        {
          provide: getDataSourceToken(),
          useValue: {
            transaction: jest.fn(
              async <T>(
                fn: (m: EntityManager) => Promise<T>,
              ): Promise<T> => fn(manager),
            ),
          },
        },
        {
          provide: getRepositoryToken(Application),
          useValue: {
            findOne: applicationsFindOne,
          } satisfies Pick<Repository<Application>, 'findOne'>,
        },
        {
          provide: getRepositoryToken(ApplicationStatusHistory),
          useValue: {
            find: historyFind,
          } satisfies Pick<Repository<ApplicationStatusHistory>, 'find'>,
        },
        {
          provide: getRepositoryToken(Client),
          useValue: {
            findOne: clientsFindOne,
          } satisfies Pick<Repository<Client>, 'findOne'>,
        },
      ],
    }).compile();
    return module.get(ApplicationsService);
  };

  beforeEach((): void => {
    lockedApp = makeApp('pending');
    clientRow = makeClient(ownerAgentId);
    savedApps = [];
    savedHistory = [];
    historyRows = [];
  });

  it('appends history and updates status in the same transaction (AC-12)', async (): Promise<void> => {
    const service = await createService();
    const dto = await service.changeStatus(
      'app-1',
      { targetStatus: 'booked', trigger: 'staff booking' },
      { id: 'admin-1', role: 'admin' },
    );

    expect(dto.status).toBe('booked');
    expect(savedApps).toHaveLength(1);
    expect(savedApps[0]?.status).toBe('booked');
    expect(savedHistory).toHaveLength(1);
    expect(savedHistory[0]?.fromStatus).toBe('pending');
    expect(savedHistory[0]?.toStatus).toBe('booked');
    expect(savedHistory[0]?.actorId).toBe('admin-1');
    expect(savedHistory[0]?.actorRole).toBe('admin');
    expect(savedHistory[0]?.trigger).toBe('staff booking');
  });

  it('allows owning agent pending→rejected (AC-12)', async (): Promise<void> => {
    const service = await createService();
    const dto = await service.changeStatus(
      'app-1',
      { targetStatus: 'rejected' },
      { id: ownerAgentId, role: 'agent' },
    );
    expect(dto.status).toBe('rejected');
    expect(savedHistory[0]?.actorRole).toBe('agent');
  });

  it('allows booked→pending and rejected→pending for staff (AC-14)', async (): Promise<void> => {
    lockedApp = makeApp('booked');
    const service = await createService();
    const dto = await service.changeStatus(
      'app-1',
      { targetStatus: 'pending' },
      { id: 'admin-1', role: 'admin' },
    );
    expect(dto.status).toBe('pending');
    expect(savedHistory[0]?.fromStatus).toBe('booked');
    expect(savedHistory[0]?.toStatus).toBe('pending');

    lockedApp = makeApp('rejected');
    savedApps = [];
    savedHistory = [];
    const dto2 = await service.changeStatus(
      'app-1',
      { targetStatus: 'pending' },
      { id: 'sa-1', role: 'superadmin' },
    );
    expect(dto2.status).toBe('pending');
  });

  it('leaves history unchanged on illegal transition (AC-12)', async (): Promise<void> => {
    lockedApp = makeApp('drafting');
    const service = await createService();

    try {
      await service.changeStatus(
        'app-1',
        { targetStatus: 'pending' },
        { id: 'admin-1', role: 'admin' },
      );
      fail('expected throw');
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
      if (error instanceof HttpException) {
        expect(error.getStatus()).toBe(HttpStatus.BAD_REQUEST);
        expect(error.getResponse()).toEqual({ detail: 'illegal_transition' });
      }
    }

    expect(savedHistory).toHaveLength(0);
    expect(savedApps).toHaveLength(0);
    expect(lockedApp?.status).toBe('drafting');
  });

  it('rejects non-owning agent with forbidden_role', async (): Promise<void> => {
    const service = await createService();
    try {
      await service.changeStatus(
        'app-1',
        { targetStatus: 'booked' },
        { id: otherAgentId, role: 'agent' },
      );
      fail('expected throw');
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
      if (error instanceof HttpException) {
        expect(error.getStatus()).toBe(HttpStatus.FORBIDDEN);
        expect(error.getResponse()).toEqual({ detail: 'forbidden_role' });
      }
    }
    expect(savedHistory).toHaveLength(0);
  });

  it('returns application_not_found when missing', async (): Promise<void> => {
    lockedApp = null;
    const service = await createService();

    try {
      await service.changeStatus(
        'missing',
        { targetStatus: 'booked' },
        { id: 'admin-1', role: 'admin' },
      );
      fail('expected throw');
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
      if (error instanceof HttpException) {
        expect(error.getStatus()).toBe(HttpStatus.NOT_FOUND);
        expect(error.getResponse()).toEqual({
          detail: 'application_not_found',
        });
      }
    }
  });

  it('monitor drafting→pending records visa_center_monitor (AC-13)', async (): Promise<void> => {
    lockedApp = makeApp('drafting');
    const service = await createService();
    const dto = await service.markPendingByMonitor('app-1');

    expect(dto.status).toBe('pending');
    expect(savedHistory).toHaveLength(1);
    expect(savedHistory[0]?.fromStatus).toBe('drafting');
    expect(savedHistory[0]?.toStatus).toBe('pending');
    expect(savedHistory[0]?.actorId).toBeNull();
    expect(savedHistory[0]?.actorRole).toBe(VISA_CENTER_MONITOR_ACTOR);
  });

  it('monitor rejects non-drafting without history append (AC-13)', async (): Promise<void> => {
    lockedApp = makeApp('pending');
    const service = await createService();
    try {
      await service.markPendingByMonitor('app-1');
      fail('expected throw');
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
      if (error instanceof HttpException) {
        expect(error.getResponse()).toEqual({ detail: 'illegal_transition' });
      }
    }
    expect(savedHistory).toHaveLength(0);
  });

  describe('getHistory (T14.2)', (): void => {
    it('returns items ordered oldest → newest', async (): Promise<void> => {
      historyRows = [
        makeHistory({
          id: 'ash-old',
          fromStatus: null,
          toStatus: 'drafting',
          actorRole: 'visa_center_monitor',
          actorId: null,
          createdAt: new Date('2026-01-01T00:00:00.000Z'),
        }),
        makeHistory({
          id: 'ash-new',
          fromStatus: 'pending',
          toStatus: 'booked',
          actorRole: 'admin',
          actorId: 'admin-1',
          createdAt: new Date('2026-01-03T00:00:00.000Z'),
        }),
      ];
      const service = await createService();
      const result = await service.getHistory('app-1', {
        id: 'admin-1',
        role: 'admin',
      });

      expect(historyFind).toHaveBeenCalledWith({
        where: { applicationId: 'app-1' },
        order: { createdAt: 'ASC' },
      });
      expect(result.items.map((item) => item.id)).toEqual([
        'ash-old',
        'ash-new',
      ]);
      expect(result.items[0]?.createdAt).toBe('2026-01-01T00:00:00.000Z');
      expect(result.items[1]?.createdAt).toBe('2026-01-03T00:00:00.000Z');
      expect(result.items[0]).not.toHaveProperty('reason');
    });

    it('returns empty items when history is empty', async (): Promise<void> => {
      historyRows = [];
      const service = await createService();
      const result = await service.getHistory('app-1', {
        id: ownerAgentId,
        role: 'agent',
      });
      expect(result).toEqual({ items: [] });
    });

    it('returns application_not_found when application missing (T15.4)', async (): Promise<void> => {
      lockedApp = null;
      const service = await createService();
      try {
        await service.getHistory('missing', {
          id: 'admin-1',
          role: 'admin',
        });
        fail('expected throw');
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        if (error instanceof HttpException) {
          expect(error.getStatus()).toBe(HttpStatus.NOT_FOUND);
          expect(error.getResponse()).toEqual({
            detail: 'application_not_found',
          });
        }
      }
      expect(applicationsFindOne).toHaveBeenCalledWith({
        where: { id: 'missing' },
      });
      expect(historyFind).not.toHaveBeenCalled();
      expect(clientsFindOne).not.toHaveBeenCalled();
    });

    it('maps unrecognized history actorRole to unknown (T15.4)', async (): Promise<void> => {
      historyRows = [
        makeHistory({
          id: 'ash-legacy',
          actorRole: 'client',
          actorId: 'legacy-user',
        }),
      ];
      const service = await createService();
      const result = await service.getHistory('app-1', {
        id: 'admin-1',
        role: 'admin',
      });
      expect(result.items).toHaveLength(1);
      expect(result.items[0]?.actorRole).toBe('unknown');
      expect(result.items[0]?.actorId).toBe('legacy-user');
    });

    it('rejects non-owning agent with forbidden_role (cross-tenant)', async (): Promise<void> => {
      historyRows = [makeHistory({})];
      const service = await createService();
      try {
        await service.getHistory('app-1', {
          id: otherAgentId,
          role: 'agent',
        });
        fail('expected throw');
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        if (error instanceof HttpException) {
          expect(error.getStatus()).toBe(HttpStatus.FORBIDDEN);
          expect(error.getResponse()).toEqual({ detail: 'forbidden_role' });
        }
      }
      expect(historyFind).not.toHaveBeenCalled();
    });

    it('allows admin to read any application history', async (): Promise<void> => {
      historyRows = [makeHistory({ id: 'ash-1' })];
      const service = await createService();
      const result = await service.getHistory('app-1', {
        id: 'admin-1',
        role: 'admin',
      });
      expect(result.items).toHaveLength(1);
      expect(result.items[0]?.id).toBe('ash-1');
      expect(result.items[0]?.actorRole).toBe('admin');
    });

    it('allows superadmin to read any application history', async (): Promise<void> => {
      historyRows = [makeHistory({ id: 'ash-sa' })];
      const service = await createService();
      const result = await service.getHistory('app-1', {
        id: 'sa-1',
        role: 'superadmin',
      });
      expect(result.items).toHaveLength(1);
      expect(result.items[0]?.id).toBe('ash-sa');
    });

    it('allows owning agent to read history', async (): Promise<void> => {
      historyRows = [makeHistory({ id: 'ash-own' })];
      const service = await createService();
      const result = await service.getHistory('app-1', {
        id: ownerAgentId,
        role: 'agent',
      });
      expect(result.items).toHaveLength(1);
      expect(result.items[0]?.id).toBe('ash-own');
    });
  });
});
