import { ConfigService } from '@nestjs/config';
import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Setting } from '../database/entities/setting.entity';
import { SeedService } from '../seed/seed.service';
import { SETTINGS_SINGLETON_ID } from './constants';
import { SettingsService } from './settings.service';

describe('SettingsService price_per_client (AC-4 / FR-3)', (): void => {
  const row: Setting = Object.assign(new Setting(), {
    id: SETTINGS_SINGLETON_ID,
    company: 'Vises',
    defaultPrice: 180,
    cities: ['Minsk'],
    destinations: ['ES'],
    emailOtpEnabled: false,
  });

  const findOne = jest.fn();
  const save = jest.fn();

  const createModule = async (): Promise<SettingsService> => {
    findOne.mockResolvedValue({ ...row, cities: [...row.cities] });
    save.mockImplementation(async (entity: Setting): Promise<Setting> => entity);

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        SettingsService,
        {
          provide: getRepositoryToken(Setting),
          useValue: { findOne, save },
        },
        {
          provide: SeedService,
          useValue: { resetDemo: jest.fn() },
        },
        {
          provide: ConfigService,
          useValue: {
            get: (): string => 'development',
          },
        },
      ],
    }).compile();

    return moduleRef.get(SettingsService);
  };

  beforeEach((): void => {
    findOne.mockReset();
    save.mockReset();
  });

  it('GET returns price_per_client as a decimal string from defaultPrice', async (): Promise<void> => {
    const service = await createModule();
    const out = await service.get();
    expect(out.price_per_client).toBe('180.00');
    expect(out).not.toHaveProperty('defaultPrice');
  });

  it('PATCH persists price_per_client onto defaultPrice', async (): Promise<void> => {
    const service = await createModule();
    const out = await service.patch({ price_per_client: '200.00' });
    expect(save).toHaveBeenCalled();
    const saved = save.mock.calls[0][0] as Setting;
    expect(saved.defaultPrice).toBe(200);
    expect(out.price_per_client).toBe('200.00');
  });
});
