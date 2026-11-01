/**
 * Stable machine-readable error codes for roles-and-applications (NFR-6).
 * No TypeScript enum — runtime values via `as const`.
 */
export const ROLES_APPLICATIONS_ERROR_CODES = [
  'insufficient_balance',
  'forbidden_role',
  'superadmin_exists',
  'illegal_transition',
  'passport_not_unlocked',
  'invalid_amount',
  'reason_required',
  'not_agent',
  'client_not_found',
  'application_not_found',
] as const;
