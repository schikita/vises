import type { StaffRole } from '@vises/contracts';

/**
 * API `user_out` shape (REQ-002).
 * Domain owner: `users` (re-exported from `users/types`).
 * Physical home stays in `common/types` while `userOut` mapper lives in `common`
 * (NFR-005 — common must not import feature modules). Batches C–D may deepen
 * owning-module types without relocating this definition unless mappers move.
 */
export type UserOut = {
  id: string;
  name: string;
  login: string;
  email: string;
  role: StaffRole;
  active: boolean;
  inviteToken: string;
  createdAt: string;
  updatedAt: string;
  password: string;
};
