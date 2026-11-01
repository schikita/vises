import { SetMetadata, type CustomDecorator } from '@nestjs/common';
import type { StaffRole } from '@vises/contracts';

export const ROLES_KEY = 'roles';

/** Marks a route as requiring one of the given StaffRole values (FR-1 / FR-12). */
export const Roles = (...roles: StaffRole[]): CustomDecorator<string> =>
  SetMetadata(ROLES_KEY, roles);
