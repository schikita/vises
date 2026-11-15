import { BLS_WORKFLOW_ERROR_CLASS } from '../../bls-workflow/constants/bls-workflow.constants';
import {
  PORTAL_STATUS_EDIT_FILL_NOT_SAFE_ERROR_CODE,
  PORTAL_STATUS_MA_ERROR_CODE,
} from '../../portal-fill';
import {
  BLS_STATUS_SUBMIT_AMBIGUOUS_ERROR_CODE,
} from '../constants';
import type {
  BlsClientFailure,
  MapBlsStatusClientFailureInput,
} from '../types';

const NOT_SAFE_ERROR_CODES = new Set<string>([
  PORTAL_STATUS_EDIT_FILL_NOT_SAFE_ERROR_CODE,
]);

const VERIFY_ERROR_CODES = new Set<string>([
  BLS_STATUS_SUBMIT_AMBIGUOUS_ERROR_CODE,
  PORTAL_STATUS_MA_ERROR_CODE.MA_DATEPICKER_FAIL,
]);

/**
 * Map STATUS_VALIDATE failure codes to SAFE / VERIFY / NOT_SAFE (spec §9).
 * Critical: `ma_edit_fill_not_safe` → NOT_SAFE_TO_REPEAT (never safeFail).
 */
export const mapBlsStatusClientFailure = (
  input: MapBlsStatusClientFailureInput,
): BlsClientFailure => {
  const errorCode = input.errorCode.trim();
  const errorMessage = input.errorMessage.slice(0, 500);

  if (NOT_SAFE_ERROR_CODES.has(errorCode)) {
    return {
      ok: false,
      errorClass: BLS_WORKFLOW_ERROR_CLASS.NOT_SAFE_TO_REPEAT,
      errorCode,
      errorMessage,
    };
  }

  if (
    input.submitAmbiguous === true ||
    VERIFY_ERROR_CODES.has(errorCode)
  ) {
    return {
      ok: false,
      errorClass: BLS_WORKFLOW_ERROR_CLASS.VERIFY_THEN_REPEAT,
      errorCode:
        errorCode || BLS_STATUS_SUBMIT_AMBIGUOUS_ERROR_CODE,
      errorMessage,
    };
  }

  return {
    ok: false,
    errorClass: BLS_WORKFLOW_ERROR_CLASS.SAFE_TO_REPEAT,
    errorCode,
    errorMessage,
  };
};
