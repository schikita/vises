import { BLS_WORKFLOW_STEP_KEY } from '../constants/bls-http-workflow.constants';
import type { BlsHttpWorkflowStepKey } from '../types/bls-http-workflow.types';

/**
 * Steps that may be SKIPPED:
 * - PASSWORD_CHANGE when the portal does not force a change (REQ-012);
 * - REGISTER when the application already has a portal account with a
 *   resolvable vaulted password (one account per passport — reuse semantics).
 */
export const isBlsHttpWorkflowStepSkippable = (
  stepKey: BlsHttpWorkflowStepKey | string,
): boolean =>
  stepKey === BLS_WORKFLOW_STEP_KEY.PASSWORD_CHANGE ||
  stepKey === BLS_WORKFLOW_STEP_KEY.REGISTER;
