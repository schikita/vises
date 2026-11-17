import { narrowHistoryActorRole } from './narrow-history-actor-role.util';

describe('narrowHistoryActorRole (T14.2 / T15.4)', (): void => {
  it.each([
    'superadmin',
    'admin',
    'agent',
    'system',
    'visa_center_monitor',
  ] as const)('accepts %s', (role): void => {
    expect(narrowHistoryActorRole(role)).toBe(role);
  });

  it('maps unknown actor roles to unknown', (): void => {
    expect(narrowHistoryActorRole('client')).toBe('unknown');
  });

  it('maps arbitrary unrecognized DB values to unknown', (): void => {
    expect(narrowHistoryActorRole('legacy_role')).toBe('unknown');
    expect(narrowHistoryActorRole('')).toBe('unknown');
  });
});
