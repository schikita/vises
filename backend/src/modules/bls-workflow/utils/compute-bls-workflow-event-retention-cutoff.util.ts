import { BLS_WORKFLOW_EVENT_RETENTION_DAYS } from '../constants/bls-workflow.constants';

/**
 * Cutoff instant: events for terminal workflows with updatedAt before this
 * are eligible for TTL delete (DEC-020).
 */
export const computeBlsWorkflowEventRetentionCutoff = (
  nowMs: number = Date.now(),
  retentionDays: number = BLS_WORKFLOW_EVENT_RETENTION_DAYS,
): Date =>
  new Date(nowMs - Math.max(0, retentionDays) * 24 * 60 * 60 * 1000);
