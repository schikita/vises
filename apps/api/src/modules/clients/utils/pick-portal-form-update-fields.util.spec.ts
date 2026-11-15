import { ClientPortalFormUpdateDto } from '../dto/client-portal-form-update.dto';
import { pickPortalFormUpdateFields } from './pick-portal-form-update-fields.util';

describe('pickPortalFormUpdateFields (APF-TASK-003 / REQ-004 / PF-TASK-002)', (): void => {
  it('picks only defined string fields and conditionals', (): void => {
    const body = Object.assign(new ClientPortalFormUpdateDto(), {
      employerName: 'Acme',
      homeCity: 'Cairo',
      phone: '+201000000000',
      purpose: 'Tourism',
      firstEntry: 'FR',
      entries: 'Multiple',
      durationDays: '15',
      portalFormConditionals: { isMinor: false },
    });

    expect(pickPortalFormUpdateFields(body)).toEqual({
      employerName: 'Acme',
      homeCity: 'Cairo',
      phone: '+201000000000',
      purpose: 'Tourism',
      firstEntry: 'FR',
      entries: 'Multiple',
      durationDays: '15',
      portalFormConditionals: { isMinor: false },
    });
  });

  it('omits keys that are absent (partial update)', (): void => {
    const body = Object.assign(new ClientPortalFormUpdateDto(), {
      occupation: 'Engineer',
    });

    const picked = pickPortalFormUpdateFields(body);
    expect(picked).toEqual({ occupation: 'Engineer' });
    expect('address' in picked).toBe(false);
    expect('phone' in picked).toBe(false);
    expect('purpose' in picked).toBe(false);
    expect('portalFormConditionals' in picked).toBe(false);
  });

  it('picks journey/contact fields when present (OQ-PF-001)', (): void => {
    const body = Object.assign(new ClientPortalFormUpdateDto(), {
      phone: '123456789',
      purpose: 'Tourism',
      firstEntry: 'Spain',
      entries: 'Multiple',
      durationDays: '15',
    });

    expect(pickPortalFormUpdateFields(body)).toEqual({
      phone: '123456789',
      purpose: 'Tourism',
      firstEntry: 'Spain',
      entries: 'Multiple',
      durationDays: '15',
    });
  });
});
