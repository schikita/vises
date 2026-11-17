import { ApplicationStatusHistory } from '../../database/entities/application-status-history.entity';
import { mapStatusHistoryToDto } from './map-status-history-to-dto.util';

describe('mapStatusHistoryToDto (T14.2 / T15.4)', (): void => {
  it('maps entity fields and omits reason', (): void => {
    const row = Object.assign(new ApplicationStatusHistory(), {
      id: 'ash-1',
      applicationId: 'app-1',
      fromStatus: 'ready_for_appointment',
      toStatus: 'booked',
      actorId: 'admin-1',
      actorRole: 'admin',
      trigger: 'staff booking',
      createdAt: new Date('2026-02-01T12:00:00.000Z'),
    });

    const dto = mapStatusHistoryToDto(row);

    expect(dto).toEqual({
      id: 'ash-1',
      fromStatus: 'ready_for_appointment',
      toStatus: 'booked',
      actorId: 'admin-1',
      actorRole: 'admin',
      trigger: 'staff booking',
      createdAt: '2026-02-01T12:00:00.000Z',
    });
    expect(dto).not.toHaveProperty('reason');
    expect(dto).not.toHaveProperty('applicationId');
  });

  it('narrows visa_center_monitor and keeps null actorId', (): void => {
    const row = Object.assign(new ApplicationStatusHistory(), {
      id: 'ash-2',
      applicationId: 'app-1',
      fromStatus: 'draft',
      toStatus: 'not_ready_for_appointment',
      actorId: null,
      actorRole: 'visa_center_monitor',
      trigger: null,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
    });

    expect(mapStatusHistoryToDto(row)).toEqual({
      id: 'ash-2',
      fromStatus: 'draft',
      toStatus: 'not_ready_for_appointment',
      actorId: null,
      actorRole: 'visa_center_monitor',
      trigger: null,
      createdAt: '2026-01-01T00:00:00.000Z',
    });
  });

  it('narrows system actorRole', (): void => {
    const row = Object.assign(new ApplicationStatusHistory(), {
      id: 'ash-sys',
      applicationId: 'app-1',
      fromStatus: 'draft',
      toStatus: 'filling',
      actorId: null,
      actorRole: 'system',
      trigger: 'portal_autofill',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
    });

    expect(mapStatusHistoryToDto(row).actorRole).toBe('system');
  });

  it('maps unrecognized actorRole to unknown without throwing', (): void => {
    const row = Object.assign(new ApplicationStatusHistory(), {
      id: 'ash-3',
      applicationId: 'app-1',
      fromStatus: 'ready_for_appointment',
      toStatus: 'booked',
      actorId: 'legacy-1',
      actorRole: 'client',
      trigger: 'legacy',
      createdAt: new Date('2026-03-01T08:00:00.000Z'),
    });

    expect(mapStatusHistoryToDto(row)).toEqual({
      id: 'ash-3',
      fromStatus: 'ready_for_appointment',
      toStatus: 'booked',
      actorId: 'legacy-1',
      actorRole: 'unknown',
      trigger: 'legacy',
      createdAt: '2026-03-01T08:00:00.000Z',
    });
  });
});
