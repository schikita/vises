import { BLS_WORKFLOW_STATUS } from '../constants/bls-workflow.constants';

/**
 * Whether staff resume is allowed (PAUSED / WAITING_RETRY / WAITING_STAFF).
 * Live lock is checked separately (409).
 */
export const isBlsWorkflowResumeEligible = (workflowStatus: string): boolean =>
  workflowStatus === BLS_WORKFLOW_STATUS.PAUSED ||
  workflowStatus === BLS_WORKFLOW_STATUS.WAITING_RETRY ||
  workflowStatus === BLS_WORKFLOW_STATUS.WAITING_STAFF;
