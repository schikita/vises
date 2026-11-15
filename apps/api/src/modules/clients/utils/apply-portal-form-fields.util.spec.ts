import { Client } from '../../database/entities/client.entity';
import { applyPortalFormFields } from './apply-portal-form-fields.util';

describe('applyPortalFormFields (APF-TASK-003 / REQ-004)', (): void => {
  it('applies only provided fields without inventing others', (): void => {
    const client = Object.assign(new Client(), {
      id: 'cli-1',
      agentId: 'agent-1',
      address: 'Line1',
      employerName: null,
      homeCity: null,
      portalFormConditionals: null,
    });

    applyPortalFormFields(client, {
      employerName: 'Acme',
      portalFormConditionals: { isMinor: 'yes' },
    });

    expect(client.employerName).toBe('Acme');
    expect(client.address).toBe('Line1');
    expect(client.homeCity).toBeNull();
    expect(client.portalFormConditionals).toEqual({ isMinor: 'yes' });
  });
});
