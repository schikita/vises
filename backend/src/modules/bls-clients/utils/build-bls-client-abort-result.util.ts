import {
  BLS_WORKFLOW_ABORT_ERROR_CODE,
  BLS_WORKFLOW_ABORT_ERROR_MESSAGE,
  BLS_WORKFLOW_ERROR_CLASS,
} from '../../bls-workflow/constants/bls-workflow.constants';
import type { BlsClientResult } from '../types/bls-client-result.types';

/** Failure-shaped client result for mid-flight cancel/pause (DEC-003 / DEC-008). */
export const buildBlsClientAbortResult = (): BlsClientResult => ({
  ok: false,
  errorClass: BLS_WORKFLOW_ERROR_CLASS.SAFE_TO_REPEAT,
  errorCode: BLS_WORKFLOW_ABORT_ERROR_CODE,
  errorMessage: BLS_WORKFLOW_ABORT_ERROR_MESSAGE,
});
