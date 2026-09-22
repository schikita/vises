import { BLS_WORKFLOW_STEP_KEY } from '../constants/bls-workflow.constants';
import type { BlsWorkflowStepKey } from '../types/bls-workflow.types';

/**
 * Only PASSWORD_CHANGE may be SKIPPED when portal does not force change (REQ-012).
 */
export const isBlsWorkflowStepSkippable = (
  stepKey: BlsWorkflowStepKey | string,
): boolean => stepKey === BLS_WORKFLOW_STEP_KEY.PASSWORD_CHANGE;
