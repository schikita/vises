import { BLS_WORKFLOW_ERROR_CLASS } from '../../constants/bls-workflow.constants';
import {
  BLS_CLIENT_STUB_ERROR_CODE,
  BLS_CLIENT_STUB_ERROR_MESSAGE,
} from '../constants';
import type { BlsClientResult } from '../types';

/** Structured SAFE_TO_REPEAT failure for unimplemented domain clients (TASK-007). */
export const buildBlsClientStubFailure = (): BlsClientResult => ({
  ok: false,
  errorClass: BLS_WORKFLOW_ERROR_CLASS.SAFE_TO_REPEAT,
  errorCode: BLS_CLIENT_STUB_ERROR_CODE,
  errorMessage: BLS_CLIENT_STUB_ERROR_MESSAGE,
});
