import { mapToStaffRole } from './map-to-staff-role.util';

describe('mapToStaffRole (T5 / FR-12)', (): void => {
  it('maps StaffRole values', (): void => {
    expect(mapToStaffRole('superadmin')).toBe('superadmin');
    expect(mapToStaffRole('admin')).toBe('admin');
    expect(mapToStaffRole('agent')).toBe('agent');
  });

  it('maps legacy manager and client to agent', (): void => {
    expect(mapToStaffRole('manager')).toBe('agent');
    expect(mapToStaffRole('client')).toBe('agent');
  });

  it('defaults unknown values to agent', (): void => {
    expect(mapToStaffRole('')).toBe('agent');
    expect(mapToStaffRole(null)).toBe('agent');
    expect(mapToStaffRole('nope')).toBe('agent');
  });
});
