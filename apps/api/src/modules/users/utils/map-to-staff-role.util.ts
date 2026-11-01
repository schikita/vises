import type { StaffRole } from '@vises/contracts';

/**
 * Narrow a raw role string to StaffRole (FR-1).
 * Legacy `manager` / `client` map to `agent`. Unknown values default to `agent`.
 * Never returns `manager` or `client`.
 */
export const mapToStaffRole = (raw: string | undefined | null): StaffRole => {
  const value = (raw ?? '').trim().toLowerCase();
  if (value === 'superadmin') {
    return 'superadmin';
  }
  if (value === 'admin') {
    return 'admin';
  }
  // Includes explicit `agent`, legacy `manager` / `client`, and unknowns.
  return 'agent';
};
