import { isOfficeStaffRole } from './is-office-staff-role.util';

describe('isOfficeStaffRole', (): void => {
  it('accepts admin and superadmin', (): void => {
    expect(isOfficeStaffRole('admin')).toBe(true);
    expect(isOfficeStaffRole('superadmin')).toBe(true);
  });

  it('rejects agent and client', (): void => {
    expect(isOfficeStaffRole('agent')).toBe(false);
    expect(isOfficeStaffRole('client')).toBe(false);
  });
});
