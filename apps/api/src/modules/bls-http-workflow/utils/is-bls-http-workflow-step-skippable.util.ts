import { BLS_WORKFLOW_STEP_KEY } from '../constants/bls-http-workflow.constants';
import type { BlsHttpWorkflowStepKey } from '../types/bls-http-workflow.types';

/**
 * Only PASSWORD_CHANGE may be SKIPPED when portal does not force change (REQ-012).
 */
export const isBlsHttpWorkflowStepSkippable = (
  stepKey: BlsHttpWorkflowStepKey | string,
): boolean => stepKey === BLS_WORKFLOW_STEP_KEY.PASSWORD_CHANGE;
