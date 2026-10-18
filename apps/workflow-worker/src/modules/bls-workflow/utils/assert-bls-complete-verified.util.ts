import {
  BLS_WORKFLOW_MSG_COMPLETE_WITHOUT_VERIFY,
} from '../constants/bls-workflow.constants';

/**
 * Gate: refuse COMPLETED without explicit external verify (REQ-007 / DEC-016).
 * Throws when `verifiedExternalState` is not strictly true.
 */
export const assertBlsCompleteVerified = (input: {
  verifiedExternalState: boolean;
}): void => {
  if (input.verifiedExternalState !== true) {
    throw new Error(BLS_WORKFLOW_MSG_COMPLETE_WITHOUT_VERIFY);
  }
};
