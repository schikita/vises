import type { StaffRole } from '@vises/contracts';

/**
 * Minimal authenticated request user for shared guards/decorators.
 * Avoids importing TypeORM entities from `modules/*` into `shared/*`.
 */
export type RequestUser = {
  role: StaffRole;
};
