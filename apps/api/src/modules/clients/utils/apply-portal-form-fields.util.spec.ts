import { Client } from '../../database/entities/client.entity';
import { applyPortalFormFields } from './apply-portal-form-fields.util';

describe('applyPortalFormFields (APF-TASK-003 / REQ-004 / PF-TASK-002)', (): void => {
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

  it('applies journey/contact fields onto existing Client columns (OQ-PF-001)', (): void => {
    const client = Object.assign(new Client(), {
      id: 'cli-1',
      agentId: 'agent-1',
      phone: null,
      purpose: null,
      firstEntry: null,
      entries: null,
      durationDays: null,
    });

    applyPortalFormFields(client, {
      phone: '123456789',
      purpose: 'Tourism',
      firstEntry: 'Spain',
      entries: 'Multiple',
      durationDays: '15',
    });

    expect(client.phone).toBe('123456789');
    expect(client.purpose).toBe('Tourism');
    expect(client.firstEntry).toBe('Spain');
    expect(client.entries).toBe('Multiple');
    expect(client.durationDays).toBe('15');
  });
});
