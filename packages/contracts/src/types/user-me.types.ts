import type { StaffRole } from './staff-role.types';

/**
 * `GET /auth/me` SPA-facing projection (Decision 2A / T15.1).
 * Agents include current balance as a decimal string (NFR-1); non-agents get `null`.
 */
export type UserMeDto = {
  id: string;
  email: string;
  role: StaffRole;
  active: boolean;
  balance: string | null;
};
