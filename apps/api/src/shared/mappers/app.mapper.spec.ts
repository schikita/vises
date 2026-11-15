import { Application } from '../../modules/database/entities/application.entity';
import { appOut } from './app.mapper';

describe('appOut (APF-TASK-003 / REQ-003)', (): void => {
  const baseApp = (): Application =>
    Object.assign(new Application(), {
      id: 'app-1',
      code: 'A1',
      clientId: 'cli-1',
      clientEmail: 'c@example.com',
      portalFormEmail: null,
      status: 'drafting',
      destination: 'ES',
      visaType: 'Schengen',
      submitCountry: 'EG',
      submitCity: 'Cairo',
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
      updatedAt: new Date('2026-01-02T00:00:00.000Z'),
    });

  it('returns clientId from application', (): void => {
    const out = appOut(baseApp());
    expect(out.clientId).toBe('cli-1');
  });

  it('returns visaSubType when set on application', (): void => {
    const app = Object.assign(baseApp(), { visaSubType: 'Tourism' });
    const out = appOut(app);
    expect(out.visaSubType).toBe('Tourism');
  });

  it('returns null visaSubType when application column is null', (): void => {
    const app = Object.assign(baseApp(), { visaSubType: null });
    const out = appOut(app);
    expect(out.visaSubType).toBeNull();
  });
});
