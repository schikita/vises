import { BLS_WORKFLOW_STATUS } from '../constants';

/** True when workflow status is staff-paused (DEC-005 pause guard). */
export const isBlsHttpWorkflowStatusPaused = (status: string): boolean =>
  status === BLS_WORKFLOW_STATUS.PAUSED;
