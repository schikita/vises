import { ClientPortalFormUpdateDto } from '../dto/client-portal-form-update.dto';
import { pickPortalFormUpdateFields } from './pick-portal-form-update-fields.util';

describe('pickPortalFormUpdateFields (APF-TASK-003 / REQ-004)', (): void => {
  it('picks only defined string fields and conditionals', (): void => {
    const body = Object.assign(new ClientPortalFormUpdateDto(), {
      employerName: 'Acme',
      homeCity: 'Cairo',
      portalFormConditionals: { isMinor: false },
    });

    expect(pickPortalFormUpdateFields(body)).toEqual({
      employerName: 'Acme',
      homeCity: 'Cairo',
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
    expect('portalFormConditionals' in picked).toBe(false);
  });
});
