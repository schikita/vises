/**
 * Staff roles for roles-and-applications (FR-1 / AC-1 / NFR-9).
 * No TypeScript enum — runtime values via `as const`.
 */
export const STAFF_ROLES = ['superadmin', 'admin', 'agent'] as const;
