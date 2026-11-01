/**
 * Stable machine-readable error codes (NFR-6). No enum.
 */
export type RolesApplicationsErrorCode =
  | 'insufficient_balance'
  | 'forbidden_role'
  | 'superadmin_exists'
  | 'illegal_transition'
  | 'passport_not_unlocked'
  | 'invalid_amount'
  | 'reason_required'
  | 'not_agent'
  | 'client_not_found'
  | 'application_not_found';
