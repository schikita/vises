import { Application } from '../../database/entities/application.entity';
import { mapApplicationToDto } from './map-application-to-dto.util';

describe('mapApplicationToDto (APF-TASK-003 / REQ-003)', (): void => {
  it('maps visaSubType onto ApplicationDto', (): void => {
    const row = Object.assign(new Application(), {
      id: 'app-1',
      clientId: 'cli-1',
      status: 'drafting',
      visaSubType: 'Business',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-02T00:00:00.000Z'),
    });

    const dto = mapApplicationToDto(row);
    expect(dto.visaSubType).toBe('Business');
  });

  it('maps null visaSubType without inventing a value', (): void => {
    const row = Object.assign(new Application(), {
      id: 'app-1',
      clientId: 'cli-1',
      status: 'drafting',
      visaSubType: null,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-02T00:00:00.000Z'),
    });

    const dto = mapApplicationToDto(row);
    expect(dto.visaSubType).toBeNull();
  });
});
