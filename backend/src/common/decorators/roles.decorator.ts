import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/** Marks a route as requiring one of the given roles (REQ-005). */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
