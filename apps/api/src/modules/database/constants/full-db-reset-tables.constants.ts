/**
 * Operational tables cleared by the full DB reset path (FR-10 / AC-18).
 * Order is child → parent friendly; TRUNCATE … CASCADE is still used at runtime.
 * Script does **not** perform a backup.
 */
export const FULL_DB_RESET_TABLES = [
  'bls_workflow_events',
  'bls_workflow_attempts',
  'bls_workflow_tasks',
  'bls_workflow_steps',
  'bls_secret_vault',
  'bls_workflows',
  'portal_autofill_runs',
  'application_status_history',
  'balance_transactions',
  'applications',
  'clients',
  'proxy6_proxies',
  'users',
  'settings',
] as const;
