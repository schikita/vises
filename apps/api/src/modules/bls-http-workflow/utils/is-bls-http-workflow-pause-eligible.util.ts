import { BLS_WORKFLOW_STATUS } from '../constants/bls-http-workflow.constants';

/**
 * Whether staff pause is allowed (active non-PAUSED statuses).
 * Already PAUSED is handled as idempotent by the service.
 */
export const isBlsHttpWorkflowPauseEligible = (workflowStatus: string): boolean =>
  workflowStatus === BLS_WORKFLOW_STATUS.PENDING ||
  workflowStatus === BLS_WORKFLOW_STATUS.RUNNING ||
  workflowStatus === BLS_WORKFLOW_STATUS.WAITING_RETRY ||
  workflowStatus === BLS_WORKFLOW_STATUS.WAITING_STAFF;
