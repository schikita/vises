import { HttpException, HttpStatus } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { getDataSourceToken, getRepositoryToken } from '@nestjs/typeorm';
import type { EntityManager } from 'typeorm';
import { BalanceService } from '../balance/balance.service';
import { Application } from '../database/entities/application.entity';
import { BalanceTransaction } from '../database/entities/balance-transaction.entity';
import { Client } from '../database/entities/client.entity';
import { User } from '../database/entities/user.entity';
import { PiiCryptoService } from '../pii';
import { SettingsService } from '../settings/settings.service';
import { ClientsService } from './clients.service';
import { MASKED_PASSPORT_VALUE } from './constants';

describe('ClientsService (T8 / FR-5–FR-8 / AC-5–AC-7 / AC-10 / AC-17)', (): void => {
  const agent: User = Object.assign(new User(), {
    id: 'agent-1',
    name: 'Agent',
    login: 'agent1',
    email: 'a@example.com',
    passwordHash: 'x',
    invitePassword: '',
    role: 'agent' as const,
    balance: '360.00',
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

  const settingsGet = jest.fn();
  const debitWithLock = jest.fn();
  const encryptFields = jest.fn();
  const decryptFields = jest.fn();
  const clientsFindOne = jest.fn();
  const clientsSave = jest.fn();
  const clientsCreateQueryBuilder = jest.fn();
  const applicationsFindOne = jest.fn();
  const applicationsCreateQueryBuilder = jest.fn();
  const ledgerFindOne = jest.fn();

  let savedClients: Client[];
  let savedApplications: Application[];
  let deletedEntities: Array<{ entity: unknown; criteria: unknown }>;
  let txnManager: EntityManager;

  type EntityManagerStub = {
    create: jest.Mock;
    save: jest.Mock;
    findOne: jest.Mock;
    find: jest.Mock;
    delete: jest.Mock;
  };

  const createManager = (): EntityManager => {
    const stub: EntityManagerStub = {
      create: jest.fn(
        (...args: unknown[]): Client | Application => {
          const EntityClass = args[0] as new () => Client | Application;
          const data =
            args.length >= 2 && typeof args[1] === 'object' && args[1] !== null
              ? (args[1] as object)
              : {};
          return Object.assign(new EntityClass(), data);
        },
      ),
      save: jest.fn(
        async (...args: unknown[]): Promise<Client | Application> => {
          const entity = (args.length >= 2 ? args[1] : args[0]) as
            | Client
            | Application;
          if (entity instanceof Client) {
            savedClients.push(entity);
          }
          if (entity instanceof Application) {
            savedApplications.push(entity);
          }
          return entity;
        },
      ),
      findOne: jest.fn(
        async (
          ...args: unknown[]
        ): Promise<Application | Client | null> => {
          const EntityClass = args[0];
          const opts = args[1] as { where?: { clientId?: string; id?: string } };
          if (EntityClass === Application) {
            return (
              savedApplications.find(
                (a) => a.clientId === opts?.where?.clientId,
              ) ?? null
            );
          }
          return null;
        },
      ),
      find: jest.fn(
        async (...args: unknown[]): Promise<Application[]> => {
          const EntityClass = args[0];
          const opts = args[1] as { where?: { clientId?: string } };
          if (EntityClass === Application) {
            return savedApplications.filter(
              (a) => a.clientId === opts?.where?.clientId,
            );
          }
          return [];
        },
      ),
      delete: jest.fn(
        async (...args: unknown[]): Promise<{ affected: number }> => {
          deletedEntities.push({ entity: args[0], criteria: args[1] });
          return { affected: 1 };
        },
      ),
    };
    // @ts-expect-error intentional EntityManager unit-test harness
    return stub as EntityManager;
  };

  const createService = async (): Promise<ClientsService> => {
    savedClients = [];
    savedApplications = [];
    deletedEntities = [];
    txnManager = createManager();
    settingsGet.mockReset();
    debitWithLock.mockReset();
    encryptFields.mockReset();
    decryptFields.mockReset();
    clientsFindOne.mockReset();
    clientsSave.mockReset();
    clientsCreateQueryBuilder.mockReset();
    applicationsFindOne.mockReset();
    applicationsCreateQueryBuilder.mockReset();
    ledgerFindOne.mockReset();

    settingsGet.mockResolvedValue({ price_per_client: '180.00' });
    debitWithLock.mockResolvedValue({
      id: 'btx-1',
      type: 'client_creation_debit',
      amount: '-180.00',
      resultingBalance: '180.00',
      clientId: 'cli-x',
    });
    encryptFields.mockImplementation(
      (fields: Record<string, string | null>) => {
        const out: Record<string, string | null> = {};
        for (const [k, v] of Object.entries(fields)) {
          out[k] = v === null ? null : `enc:${v}`;
        }
        return out;
      },
    );
    decryptFields.mockImplementation(
      (fields: Record<string, string | null>) => {
        const out: Record<string, string | null> = {};
        for (const [k, v] of Object.entries(fields)) {
          out[k] =
            v === null || v === undefined
              ? null
              : String(v).replace(/^enc:/, '');
        }
        return out;
      },
    );
    clientsSave.mockImplementation(async (c: Client): Promise<Client> => c);

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        ClientsService,
        {
          provide: getDataSourceToken(),
          useValue: {
            transaction: jest
              .fn()
              .mockImplementation(
                async <T>(
                  fn: (m: EntityManager) => Promise<T>,
                ): Promise<T> => fn(txnManager),
              ),
          },
        },
        {
          provide: getRepositoryToken(Client),
          useValue: {
            findOne: clientsFindOne,
            save: clientsSave,
            createQueryBuilder: clientsCreateQueryBuilder,
          },
        },
        {
          provide: getRepositoryToken(Application),
          useValue: {
            findOne: applicationsFindOne,
            createQueryBuilder: applicationsCreateQueryBuilder,
          },
        },
        {
          provide: getRepositoryToken(BalanceTransaction),
          useValue: { findOne: ledgerFindOne },
        },
        {
          provide: BalanceService,
          useValue: { debitWithLock },
        },
        {
          provide: PiiCryptoService,
          useValue: { encryptFields, decryptFields },
        },
        {
          provide: SettingsService,
          useValue: { get: settingsGet },
        },
      ],
    }).compile();

    return moduleRef.get(ClientsService);
  };

  it('create succeeds: Client + Application(drafting) + debitWithLock one txn', async (): Promise<void> => {
    const service = await createService();
    const dto = await service.create({ email: 'c@example.com' }, agent);

    expect(settingsGet).toHaveBeenCalled();
    expect(savedClients).toHaveLength(1);
    expect(savedApplications).toHaveLength(1);
    expect(savedApplications[0]?.status).toBe('drafting');
    expect(savedApplications[0]?.clientId).toBe(savedClients[0]?.id);
    expect(savedApplications[0]?.paymentAmount).toBe(180);
    expect(debitWithLock).toHaveBeenCalledTimes(1);
    expect(debitWithLock).toHaveBeenCalledWith(
      txnManager,
      expect.objectContaining({
        agentId: 'agent-1',
        actorId: 'agent-1',
        amount: '180.00',
        clientId: savedClients[0]?.id,
        reason: 'client_creation',
      }),
    );
    expect(dto.agentId).toBe('agent-1');
    expect(dto.email).toBe('c@example.com');
    expect(dto.applicationId).toBe(savedApplications[0]?.id);
    expect(dto.passport.passportNumber).toBeNull();
  });

  it('createClientWithDebit creates Client + debit without Application (DEC-PF-011)', async (): Promise<void> => {
    const service = await createService();
    const client = await service.createClientWithDebit(agent, {
      email: 'c@example.com',
    });

    expect(savedClients).toHaveLength(1);
    expect(savedClients[0]?.id).toBe(client.id);
    expect(savedClients[0]?.email).toBe('c@example.com');
    expect(savedApplications).toHaveLength(0);
    expect(debitWithLock).toHaveBeenCalledTimes(1);
    expect(debitWithLock).toHaveBeenCalledWith(
      txnManager,
      expect.objectContaining({
        agentId: 'agent-1',
        clientId: client.id,
        reason: 'client_creation',
      }),
    );
  });

  it('createClientWithDebit allows staff actor without assertAgentCreate', async (): Promise<void> => {
    const service = await createService();
    const client = await service.createClientWithDebit(admin, {
      email: 'staff-created@example.com',
    });

    expect(client.agentId).toBe('admin-1');
    expect(savedApplications).toHaveLength(0);
    expect(debitWithLock).toHaveBeenCalledTimes(1);
  });

  it('create with insufficient balance surfaces insufficient_balance (AC-5)', async (): Promise<void> => {
    const service = await createService();
    debitWithLock.mockRejectedValue(
      new HttpException(
        { detail: 'insufficient_balance' },
        HttpStatus.CONFLICT,
      ),
    );

    expect.assertions(3);
    try {
      await service.create({}, agent);
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

  it('create rejects admin with forbidden_role (AC-6)', async (): Promise<void> => {
    const service = await createService();
    expect.assertions(3);
    try {
      await service.create({}, admin);
    } catch (error: unknown) {
      expect(error).toBeInstanceOf(HttpException);
      if (error instanceof HttpException) {
        expect(error.getResponse()).toEqual({ detail: 'forbidden_role' });
      }
    }
    expect(debitWithLock).not.toHaveBeenCalled();
  });

  it('create serializes via debitWithLock on the shared transaction manager (AC-6a)', async (): Promise<void> => {
    const service = await createService();
    await service.create({}, agent);
    expect(debitWithLock.mock.calls[0]?.[0]).toBe(txnManager);
  });

  it('updatePassport rejects without debit ledger (AC-7 passport_not_unlocked)', async (): Promise<void> => {
    const service = await createService();
    const client = Object.assign(new Client(), {
      id: 'cli-1',
      agentId: 'agent-1',
      email: null,
      phone: null,
      address: null,
      purpose: null,
      firstEntry: null,
      entries: null,
      durationDays: null,
      relationship: null,
      passportNumber: null,
      passportIssued: null,
      passportExpires: null,
      passportType: null,
      passportIssueCountry: null,
      passportIssuedBy: null,
      firstName: null,
      lastName: null,
      lastNameAtBirth: null,
      dob: null,
      placeOfBirth: null,
      countryOfBirth: null,
      nationality: null,
      nationalityAtBirth: null,
      nationalId: null,
      otherNames: null,
      gender: null,
      maritalStatus: null,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    });
    clientsFindOne.mockResolvedValue(client);
    ledgerFindOne.mockResolvedValue(null);

    expect.assertions(4);
    try {
      await service.updatePassport(
        'cli-1',
        { passportNumber: 'AB1234567' },
        agent,
      );
    } catch (error: unknown) {
      expect(error).toBeInstanceOf(HttpException);
      if (error instanceof HttpException) {
        expect(error.getStatus()).toBe(HttpStatus.CONFLICT);
        expect(error.getResponse()).toEqual({
          detail: 'passport_not_unlocked',
        });
      }
    }
    expect(encryptFields).not.toHaveBeenCalled();
  });

  it('updatePassport encrypts via PiiModule when ledger debit exists (AC-9)', async (): Promise<void> => {
    const service = await createService();
    const client = Object.assign(new Client(), {
      id: 'cli-1',
      agentId: 'agent-1',
      email: null,
      phone: null,
      address: null,
      purpose: null,
      firstEntry: null,
      entries: null,
      durationDays: null,
      relationship: null,
      passportNumber: null,
      passportIssued: null,
      passportExpires: null,
      passportType: null,
      passportIssueCountry: null,
      passportIssuedBy: null,
      firstName: null,
      lastName: null,
      lastNameAtBirth: null,
      dob: null,
      placeOfBirth: null,
      countryOfBirth: null,
      nationality: null,
      nationalityAtBirth: null,
      nationalId: null,
      otherNames: null,
      gender: null,
      maritalStatus: null,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    });
    clientsFindOne.mockResolvedValue(client);
    ledgerFindOne.mockResolvedValue(
      Object.assign(new BalanceTransaction(), {
        id: 'btx-1',
        type: 'client_creation_debit',
        clientId: 'cli-1',
      }),
    );
    applicationsFindOne.mockResolvedValue(
      Object.assign(new Application(), { id: 'app-1', clientId: 'cli-1' }),
    );

    const dto = await service.updatePassport(
      'cli-1',
      { passportNumber: 'AB1234567', firstName: 'Ada' },
      agent,
    );

    expect(encryptFields).toHaveBeenCalledWith({
      passportNumber: 'AB1234567',
      firstName: 'Ada',
    });
    expect(client.passportNumber).toBe('enc:AB1234567');
    expect(client.firstName).toBe('enc:Ada');
    expect(dto.passport.passportNumber).toBe(MASKED_PASSPORT_VALUE);
    expect(dto.passport.firstName).toBe(MASKED_PASSPORT_VALUE);
    expect(JSON.stringify(dto)).not.toContain('AB1234567');
    expect(JSON.stringify(dto)).not.toContain('Ada');
  });

  it('getPassport decrypts with audit context when unlocked (AC-10)', async (): Promise<void> => {
    const service = await createService();
    const client = Object.assign(new Client(), {
      id: 'cli-1',
      agentId: 'agent-1',
      email: null,
      phone: null,
      address: null,
      purpose: null,
      firstEntry: null,
      entries: null,
      durationDays: null,
      relationship: null,
      passportNumber: 'enc:AB1234567',
      passportIssued: null,
      passportExpires: null,
      passportType: null,
      passportIssueCountry: null,
      passportIssuedBy: null,
      firstName: 'enc:Ada',
      lastName: null,
      lastNameAtBirth: null,
      dob: null,
      placeOfBirth: null,
      countryOfBirth: null,
      nationality: null,
      nationalityAtBirth: null,
      nationalId: null,
      otherNames: null,
      gender: null,
      maritalStatus: null,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    });
    clientsFindOne.mockResolvedValue(client);
    ledgerFindOne.mockResolvedValue(
      Object.assign(new BalanceTransaction(), {
        id: 'btx-1',
        type: 'client_creation_debit',
        clientId: 'cli-1',
      }),
    );

    const plain = await service.getPassport('cli-1', agent);
    expect(decryptFields).toHaveBeenCalledWith(
      expect.objectContaining({
        passportNumber: 'enc:AB1234567',
        firstName: 'enc:Ada',
      }),
      expect.objectContaining({
        actorId: 'agent-1',
        actorRole: 'agent',
        action: 'passport_read',
        clientId: 'cli-1',
      }),
    );
    expect(plain.passportNumber).toBe('AB1234567');
    expect(plain.firstName).toBe('Ada');
  });

  it('remove deletes client + application without balance debit/refund (AC-17)', async (): Promise<void> => {
    const service = await createService();
    const client = Object.assign(new Client(), {
      id: 'cli-1',
      agentId: 'agent-1',
    });
    clientsFindOne.mockResolvedValue(client);
    savedApplications.push(
      Object.assign(new Application(), {
        id: 'app-1',
        clientId: 'cli-1',
        status: 'drafting',
      }),
    );

    const result = await service.remove('cli-1', admin);
    expect(result).toEqual({ ok: true });
    expect(debitWithLock).not.toHaveBeenCalled();
    expect(deletedEntities.length).toBeGreaterThanOrEqual(2);
    expect(
      deletedEntities.some((d) => d.entity === Application),
    ).toBe(true);
    expect(deletedEntities.some((d) => d.entity === Client)).toBe(true);
  });

  it('list returns ClientListDto with maskedPassport only (Decision 2A)', async (): Promise<void> => {
    const service = await createService();
    const client = Object.assign(new Client(), {
      id: 'cli-1',
      agentId: 'agent-1',
      email: 'c@example.com',
      phone: null,
      address: null,
      purpose: null,
      firstEntry: null,
      entries: null,
      durationDays: null,
      relationship: null,
      passportNumber: 'enc:AB1234567',
      passportIssued: null,
      passportExpires: null,
      passportType: null,
      passportIssueCountry: null,
      passportIssuedBy: null,
      firstName: 'enc:Ada',
      lastName: 'enc:Lovelace',
      lastNameAtBirth: null,
      dob: null,
      placeOfBirth: null,
      countryOfBirth: null,
      nationality: null,
      nationalityAtBirth: null,
      nationalId: null,
      otherNames: null,
      gender: null,
      maritalStatus: null,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    });

    const qb = {
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn(async (): Promise<Client[]> => [client]),
    };
    clientsCreateQueryBuilder.mockReturnValue(qb);
    applicationsCreateQueryBuilder.mockReturnValue({
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn(
        async (): Promise<Application[]> => [
          Object.assign(new Application(), {
            id: 'app-1',
            clientId: 'cli-1',
            status: 'drafting',
            updatedAt: new Date('2026-01-01T00:00:00.000Z'),
          }),
        ],
      ),
    });

    const rows = await service.list(agent);
    expect(rows).toHaveLength(1);
    const row = rows[0];
    expect(row).toBeDefined();
    if (!row) {
      return;
    }
    expect(Object.keys(row).sort()).toEqual(
      [
        'agentId',
        'createdAt',
        'firstName',
        'id',
        'lastName',
        'maskedPassport',
        'status',
      ].sort(),
    );
    expect(row.firstName).toBe('Ada');
    expect(row.lastName).toBe('Lovelace');
    expect(row.maskedPassport).toBe('AB****67');
    expect(row.status).toBe('drafting');
    expect(row).not.toHaveProperty('passport');
    expect(row).not.toHaveProperty('passportNumber');
    expect(JSON.stringify(rows)).not.toContain('AB1234567');
    expect(JSON.stringify(rows)).not.toContain('enc:');
    expect(decryptFields).toHaveBeenCalled();
  });

  it('list uses empty-string defaults when names/passport missing', async (): Promise<void> => {
    const service = await createService();
    const client = Object.assign(new Client(), {
      id: 'cli-empty',
      agentId: 'agent-1',
      email: null,
      phone: null,
      address: null,
      purpose: null,
      firstEntry: null,
      entries: null,
      durationDays: null,
      relationship: null,
      passportNumber: null,
      passportIssued: null,
      passportExpires: null,
      passportType: null,
      passportIssueCountry: null,
      passportIssuedBy: null,
      firstName: null,
      lastName: null,
      lastNameAtBirth: null,
      dob: null,
      placeOfBirth: null,
      countryOfBirth: null,
      nationality: null,
      nationalityAtBirth: null,
      nationalId: null,
      otherNames: null,
      gender: null,
      maritalStatus: null,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    });

    clientsCreateQueryBuilder.mockReturnValue({
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn(async (): Promise<Client[]> => [client]),
    });
    applicationsCreateQueryBuilder.mockReturnValue({
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn(
        async (): Promise<Application[]> => [
          Object.assign(new Application(), {
            id: 'app-empty',
            clientId: 'cli-empty',
            status: 'pending',
            updatedAt: new Date('2026-01-01T00:00:00.000Z'),
          }),
        ],
      ),
    });

    const rows = await service.list(agent);
    expect(rows[0]?.firstName).toBe('');
    expect(rows[0]?.lastName).toBe('');
    expect(rows[0]?.maskedPassport).toBe('');
  });

  it('getById returns ClientDetailDto plaintext and audits decrypt (Decision 2A)', async (): Promise<void> => {
    const service = await createService();
    const client = Object.assign(new Client(), {
      id: 'cli-1',
      agentId: 'agent-1',
      email: null,
      phone: null,
      address: null,
      homeAddressLine2: null,
      homeCountry: null,
      homeCity: 'Cairo',
      homePostalCode: null,
      employerName: 'Acme Corp',
      employerPhone: null,
      employerAddress: null,
      occupation: null,
      previousFingerPrintStatus: null,
      previousFingerPrintDate: null,
      blsInvitingAuthority: null,
      invitingAuthorityName: null,
      invitingCountry: null,
      invitingCity: null,
      invitingZipCode: null,
      invitingAddress: null,
      invitingEmail: null,
      invitingContactNo: null,
      invitingFaxNo: null,
      invitingContactName: null,
      invitingContactSurname: null,
      invitingContactCountry: null,
      invitingContactCity: null,
      invitingContactZipCode: null,
      invitingContactAddress: null,
      invitingContactContactNo: null,
      invitingContactEmail: null,
      invitingContactFaxNo: null,
      costCoveredBy: null,
      meansOfSupport: null,
      memberStateSecondDestination: null,
      portalFormConditionals: null,
      purpose: null,
      firstEntry: null,
      entries: null,
      durationDays: null,
      relationship: null,
      passportNumber: 'enc:AB1234567',
      passportIssued: null,
      passportExpires: null,
      passportType: null,
      passportIssueCountry: null,
      passportIssuedBy: null,
      firstName: 'enc:Ada',
      lastName: 'enc:Lovelace',
      lastNameAtBirth: null,
      dob: null,
      placeOfBirth: null,
      countryOfBirth: null,
      nationality: null,
      nationalityAtBirth: null,
      nationalId: null,
      otherNames: null,
      gender: null,
      maritalStatus: null,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-02T00:00:00.000Z'),
    });
    clientsFindOne.mockResolvedValue(client);
    applicationsFindOne.mockResolvedValue(
      Object.assign(new Application(), {
        id: 'app-1',
        clientId: 'cli-1',
        status: 'drafting',
      }),
    );

    const detail = await service.getById('cli-1', agent);
    expect(decryptFields).toHaveBeenCalledWith(
      expect.objectContaining({
        passportNumber: 'enc:AB1234567',
        firstName: 'enc:Ada',
        lastName: 'enc:Lovelace',
      }),
      expect.objectContaining({
        actorId: 'agent-1',
        actorRole: 'agent',
        action: 'passport_read',
        clientId: 'cli-1',
      }),
    );
    expect(detail.passportNumber).toBe('AB1234567');
    expect(detail.firstName).toBe('Ada');
    expect(detail.lastName).toBe('Lovelace');
    expect(detail.applicationId).toBe('app-1');
    expect(detail.applicationStatus).toBe('drafting');
    expect(detail).toHaveProperty('employerName', 'Acme Corp');
    expect(detail).toHaveProperty('homeCity', 'Cairo');
    expect(detail.address).toBeNull();
    expect(detail.occupation).toBeNull();
    expect(detail.portalFormConditionals).toBeNull();
    expect(detail).not.toHaveProperty('passport');
    expect(detail).not.toHaveProperty('maskedPassport');
  });

  it('updatePortalForm persists fields without passport unlock gate (APF-TASK-003)', async (): Promise<void> => {
    const service = await createService();
    const client = Object.assign(new Client(), {
      id: 'cli-1',
      agentId: 'agent-1',
      address: null,
      homeCity: null,
      employerName: null,
      portalFormConditionals: null,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    });
    clientsFindOne.mockResolvedValue(client);
    clientsSave.mockImplementation(async (row: Client): Promise<Client> => row);

    const out = await service.updatePortalForm(
      'cli-1',
      {
        address: 'Street 1',
        employerName: 'Acme',
        portalFormConditionals: { isMinor: false },
      },
      agent,
    );

    expect(ledgerFindOne).not.toHaveBeenCalled();
    expect(encryptFields).not.toHaveBeenCalled();
    expect(clientsSave).toHaveBeenCalled();
    expect(out.address).toBe('Street 1');
    expect(out.employerName).toBe('Acme');
    expect(out.portalFormConditionals).toEqual({ isMinor: false });
    expect(out.homeCity).toBeNull();
  });

  it('getById cross-tenant agent → forbidden_role', async (): Promise<void> => {
    const service = await createService();
    const otherAgent: User = Object.assign(new User(), {
      id: 'agent-2',
      name: 'Other',
      login: 'agent2',
      email: 'o@example.com',
      passwordHash: 'x',
      invitePassword: '',
      role: 'agent' as const,
      balance: '0.00',
      active: true,
      inviteToken: 'tok2',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    });
    clientsFindOne.mockResolvedValue(
      Object.assign(new Client(), {
        id: 'cli-1',
        agentId: 'agent-1',
      }),
    );

    expect.assertions(4);
    try {
      await service.getById('cli-1', otherAgent);
    } catch (error: unknown) {
      expect(error).toBeInstanceOf(HttpException);
      if (error instanceof HttpException) {
        expect(error.getStatus()).toBe(HttpStatus.FORBIDDEN);
        expect(error.getResponse()).toEqual({ detail: 'forbidden_role' });
      }
    }
    expect(decryptFields).not.toHaveBeenCalled();
  });

  it('getById missing client → client_not_found', async (): Promise<void> => {
    const service = await createService();
    clientsFindOne.mockResolvedValue(null);
    expect.assertions(2);
    try {
      await service.getById('missing', agent);
    } catch (error: unknown) {
      expect(error).toBeInstanceOf(HttpException);
      if (error instanceof HttpException) {
        expect(error.getResponse()).toEqual({ detail: 'client_not_found' });
      }
    }
  });
});
