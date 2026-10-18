/**
 * Placeholder union — real durable statuses migrate from Nest bls-workflow later.
 * Kept minimal so the package compiles without Nest deps.
 */
export type BlsWorkflowStatusPlaceholder =
  | 'PENDING'
  | 'RUNNING'
  | 'PAUSED'
  | 'CANCELLED'
  | 'SUCCEEDED'
  | 'FAILED';
