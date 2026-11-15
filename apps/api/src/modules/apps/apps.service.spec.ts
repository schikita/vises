import { ConfigService } from '@nestjs/config';
import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { tmpdir } from 'os';
import { join } from 'path';
import { Application } from '../database/entities/application.entity';
import { User } from '../database/entities/user.entity';
import { BlsWorkflowService } from '../bls-workflow';
import { WorkflowBusPublisherService } from '../messaging';
import { PortalAutofillService } from '../portal-scrape';
import { UsersService } from '../users/users.service';
import { AppsService } from './apps.service';
import type { UpsertAppDto } from './dto/upsert-app.dto';

describe('AppsService visaSubType (APF-TASK-003 / REQ-003)', (): void => {
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

  const appsFindOne = jest.fn();
  const appsSave = jest.fn();
  const appsCreate = jest.fn();
  const getClientPortalProgressForApps = jest.fn();

  const createService = async (): Promise<AppsService> => {
    appsFindOne.mockReset();
    appsSave.mockReset();
    appsCreate.mockReset();
    getClientPortalProgressForApps.mockReset();

    appsSave.mockImplementation(async (row: Application): Promise<Application> => row);
    appsCreate.mockImplementation(
      (partial: Partial<Application>): Application =>
        Object.assign(new Application(), partial),
    );
    getClientPortalProgressForApps.mockImplementation(
      async (
        apps: ReadonlyArray<{ id: string }>,
      ): Promise<Map<string, Record<string, unknown>>> => {
        const map = new Map<string, Record<string, unknown>>();
        for (const app of apps) {
          map.set(app.id, { siteKey: null, runs: [] });
        }
        return map;
      },
    );

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        AppsService,
        {
          provide: getRepositoryToken(Application),
          useValue: {
            findOne: appsFindOne,
            save: appsSave,
            create: appsCreate,
          },
        },
        {
          provide: UsersService,
          useValue: { ensureClientForIdentity: jest.fn() },
        },
        {
          provide: PortalAutofillService,
          useValue: { getClientPortalProgressForApps },
        },
        {
          provide: BlsWorkflowService,
          useValue: { ensureForApplication: jest.fn() },
        },
        {
          provide: WorkflowBusPublisherService,
          useValue: { publish: jest.fn() },
        },
        {
          provide: ConfigService,
          useValue: {
            get: (key: string): string | undefined => {
              if (key === 'UPLOAD_DIR') {
                return join(tmpdir(), 'vises-apps-service-spec-uploads');
              }
              return undefined;
            },
          },
        },
      ],
    }).compile();

    return moduleRef.get(AppsService);
  };

  const existingRow = (visaSubType: string | null): Application =>
    Object.assign(new Application(), {
      id: 'app-1',
      clientId: 'cli-1',
      code: 'A1',
      clientEmail: 'c@example.com',
      portalFormEmail: null,
      status: 'drafting',
      destination: '',
      visaType: '',
      visaSubType,
      submitCountry: '',
      submitCity: '',
      travelDate: '',
      returnDate: '',
      comment: '',
      documents: [],
      paymentAmount: 180,
      paymentPaid: false,
      paymentNote: '',
      visitDate: '',
      visitTime: '',
      visitPlace: '',
      manager: '',
      extras: {},
      timeline: [],
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    });

  it('upsert persists body.visaSubType onto application', async (): Promise<void> => {
    const service = await createService();
    const row = existingRow(null);
    appsFindOne.mockResolvedValue(row);

    const body: UpsertAppDto = {
      id: 'app-1',
      visaSubType: 'Tourism',
      portalWorkflowAction: 'none',
    };

    const result = await service.upsert(body, admin);

    expect(appsSave).toHaveBeenCalled();
    const saved = appsSave.mock.calls[0][0] as Application;
    expect(saved.visaSubType).toBe('Tourism');
    expect(result.application.visaSubType).toBe('Tourism');
  });

  it('upsert omits visaSubType and preserves existing value', async (): Promise<void> => {
    const service = await createService();
    const row = existingRow('Existing Sub Type');
    appsFindOne.mockResolvedValue(row);

    const body: UpsertAppDto = {
      id: 'app-1',
      destination: 'ES',
      portalWorkflowAction: 'none',
    };

    const result = await service.upsert(body, admin);

    expect(appsSave).toHaveBeenCalled();
    const saved = appsSave.mock.calls[0][0] as Application;
    expect(saved.visaSubType).toBe('Existing Sub Type');
    expect(result.application.visaSubType).toBe('Existing Sub Type');
    expect(result.application.destination).toBe('ES');
  });
});
