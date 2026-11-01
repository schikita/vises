/**
 * FR-12 — former `manager` / `client` list filters map to `agent`.
 * Leaves `all` and StaffRole values unchanged.
 */
export const normalizeUsersListRoleFilter = (role: string): string => {
  const value = role.trim().toLowerCase();
  if (value === 'manager' || value === 'client') {
    return 'agent';
  }
  return role.trim();
};
