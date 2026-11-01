import { normalizeUsersListRoleFilter } from './normalize-users-list-role-filter.util';

describe('normalizeUsersListRoleFilter (T5 / FR-12)', (): void => {
  it('maps legacy manager and client to agent', (): void => {
    expect(normalizeUsersListRoleFilter('manager')).toBe('agent');
    expect(normalizeUsersListRoleFilter('client')).toBe('agent');
    expect(normalizeUsersListRoleFilter('Manager')).toBe('agent');
  });

  it('leaves StaffRole and all unchanged', (): void => {
    expect(normalizeUsersListRoleFilter('agent')).toBe('agent');
    expect(normalizeUsersListRoleFilter('admin')).toBe('admin');
    expect(normalizeUsersListRoleFilter('superadmin')).toBe('superadmin');
    expect(normalizeUsersListRoleFilter('all')).toBe('all');
  });
});
