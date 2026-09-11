/** Known application roles (auth demo + user create defaults). */
export const USER_ROLES = ['admin', 'manager', 'client'] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const DEFAULT_USER_ROLE: UserRole = 'client';

export const ADMIN_ROLE: UserRole = 'admin';
